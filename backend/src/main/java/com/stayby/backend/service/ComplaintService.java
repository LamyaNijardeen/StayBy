package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.Complaint;
import com.stayby.backend.entity.ComplaintStatus;
import com.stayby.backend.entity.Role;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.ComplaintRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

        private final ComplaintRepository complaintRepository;
        private final BookingRepository bookingRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        public ComplaintService(
                        ComplaintRepository complaintRepository,
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {

                this.complaintRepository = complaintRepository;
                this.bookingRepository = bookingRepository;
                this.userRepository = userRepository;
                this.notificationService = notificationService;
        }

        public Complaint createComplaint(
                        Long travelerId,
                        Long bookingId,
                        String subject,
                        String description) {

                User traveler = userRepository
                                .findById(travelerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Traveler not found"));

                Booking booking = bookingRepository
                                .findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                if (booking.getUser() == null
                                || !booking.getUser()
                                                .getId()
                                                .equals(travelerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to report this booking");
                }

                if (subject == null
                                || subject.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Complaint subject is required");
                }

                if (description == null
                                || description.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Complaint description is required");
                }

                if (subject.trim().length() > 100) {

                        throw new IllegalArgumentException(
                                        "Complaint subject cannot exceed 100 characters");
                }

                if (description.trim().length() > 2000) {

                        throw new IllegalArgumentException(
                                        "Complaint description cannot exceed 2000 characters");
                }

                Complaint complaint = new Complaint();

                complaint.setTraveler(traveler);
                complaint.setBooking(booking);
                complaint.setSubject(subject.trim());
                complaint.setDescription(description.trim());
                complaint.setStatus(ComplaintStatus.PENDING);

                Complaint savedComplaint = complaintRepository.save(complaint);

                // =====================================================
                // NOTIFY ALL ADMINS
                // =====================================================
                List<User> admins = userRepository.findAll()
                                .stream()
                                .filter(user -> user.getRole() == Role.ADMIN)
                                .toList();

                for (User admin : admins) {

                        notificationService.createNotification(
                                        admin,
                                        "COMPLAINT_NEW",
                                        "New complaint submitted",
                                        traveler.getName()
                                                        + " submitted a new complaint #"
                                                        + savedComplaint.getId()
                                                        + ".",
                                        savedComplaint.getId());
                }

                return savedComplaint;
        }

        public List<Complaint> getTravelerComplaints(
                        Long travelerId) {

                return complaintRepository
                                .findByTravelerIdOrderByCreatedAtDesc(
                                                travelerId);
        }

        public List<Complaint> getAllComplaints() {

                return complaintRepository
                                .findAllByOrderByCreatedAtDesc();
        }

        public Complaint updateStatus(
                        Long complaintId,
                        ComplaintStatus status) {

                Complaint complaint = complaintRepository
                                .findById(complaintId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Complaint not found"));

                if (status == null) {

                        throw new IllegalArgumentException(
                                        "Complaint status is required");
                }

                if ((status == ComplaintStatus.RESOLVED
                                || status == ComplaintStatus.REJECTED)
                                && (complaint.getAdminResponse() == null
                                                || complaint.getAdminResponse()
                                                                .trim()
                                                                .isEmpty())) {

                        throw new IllegalArgumentException(
                                        "An admin response is required before resolving or rejecting the complaint.");
                }

                ComplaintStatus previousStatus = complaint.getStatus();

                if (previousStatus == status) {
                        return complaint;
                }

                boolean validTransition = isValidStatusTransition(
                                previousStatus,
                                status);

                if (!validTransition) {

                        throw new IllegalArgumentException(
                                        "Invalid complaint status transition from "
                                                        + previousStatus
                                                        + " to "
                                                        + status);
                }

                if (status == ComplaintStatus.RESOLVED
                                || status == ComplaintStatus.REJECTED) {

                        String adminResponse = complaint.getAdminResponse();

                        if (adminResponse == null
                                        || adminResponse.trim().isEmpty()) {

                                throw new IllegalArgumentException(
                                                "An admin response is required before resolving or rejecting the complaint");
                        }
                }

                complaint.setStatus(status);

                Complaint savedComplaint = complaintRepository.save(complaint);

                // =====================================================
                // NOTIFY TRAVELER
                // =====================================================

                notificationService.createNotification(
                                complaint.getTraveler(),
                                "COMPLAINT_STATUS",
                                "Complaint status updated",
                                "Your complaint #"
                                                + complaint.getId()
                                                + " is now "
                                                + status.name()
                                                                .replace("_", " ")
                                                + ".",
                                complaint.getId());

                return savedComplaint;
        }

        private boolean isValidStatusTransition(
                        ComplaintStatus currentStatus,
                        ComplaintStatus newStatus) {

                if (currentStatus == ComplaintStatus.PENDING) {

                        return newStatus == ComplaintStatus.IN_REVIEW;
                }

                if (currentStatus == ComplaintStatus.IN_REVIEW) {

                        return newStatus == ComplaintStatus.RESOLVED
                                        || newStatus == ComplaintStatus.REJECTED;
                }

                return false;
        }

        public Complaint updateAdminResponse(
                        Long complaintId,
                        String adminResponse) {

                Complaint complaint = complaintRepository
                                .findById(complaintId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Complaint not found"));

                if (adminResponse == null) {

                        throw new IllegalArgumentException(
                                        "Admin response is required");
                }

                adminResponse = adminResponse.trim();

                if (adminResponse.length() > 2000) {

                        throw new IllegalArgumentException(
                                        "Admin response cannot exceed 2000 characters");
                }

                if (adminResponse.isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Admin response cannot be empty");
                }

                String previousResponse = complaint.getAdminResponse();

                boolean responseChanged = previousResponse == null
                                || !previousResponse.equals(
                                                adminResponse);

                complaint.setAdminResponse(adminResponse);

                Complaint savedComplaint = complaintRepository.save(complaint);

                // =====================================================
                // NOTIFY TRAVELER
                // =====================================================

                if (responseChanged) {

                        notificationService.createNotification(
                                        complaint.getTraveler(),
                                        "COMPLAINT_RESPONSE",
                                        "Admin responded to your complaint",
                                        "An admin has responded to your complaint #"
                                                        + complaint.getId()
                                                        + ".",
                                        complaint.getId());
                }

                return savedComplaint;
        }
}