package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.entity.Refund;
import com.stayby.backend.entity.RefundStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import com.stayby.backend.repository.RefundRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundService {

        private final RefundRepository refundRepository;
        private final PaymentRepository paymentRepository;
        private final BookingRepository bookingRepository;
        private final EmailService emailService;
        private final RefundSlipService refundSlipService;

        public RefundService(
                        RefundRepository refundRepository,
                        PaymentRepository paymentRepository,
                        BookingRepository bookingRepository,
                        EmailService emailService,
                        RefundSlipService refundSlipService) {
                this.refundRepository = refundRepository;
                this.paymentRepository = paymentRepository;
                this.bookingRepository = bookingRepository;
                this.emailService = emailService;
                this.refundSlipService = refundSlipService;
        }

        // =========================================================
        // CREATE REFUND REQUEST
        // =========================================================

        public Refund createRefund(
                        Long bookingId,
                        String reason,
                        Long ownerId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                // Verify that the booking belongs to this owner
                if (booking.getRoom() == null
                                || booking.getRoom().getProperty() == null
                                || booking.getRoom().getProperty().getOwner() == null
                                || !booking.getRoom()
                                                .getProperty()
                                                .getOwner()
                                                .getId()
                                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to manage this refund");
                }

                Payment payment = paymentRepository
                                .findByBookingId(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Payment record not found"));

                if (payment.getStatus() != PaymentStatus.PAID) {
                        throw new IllegalArgumentException(
                                        "Only paid bookings can be refunded");
                }

                if (booking.getStatus() != BookingStatus.CANCELLED) {
                        throw new IllegalArgumentException(
                                        "Only cancelled bookings can be refunded");
                }

                if (refundRepository.existsByPaymentId(payment.getId())) {
                        throw new IllegalArgumentException(
                                        "A refund already exists for this payment");
                }

                if (reason == null
                                || reason.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Refund reason is required");
                }

                String cleanedReason = reason.trim();

                if (cleanedReason.length() > 500) {
                        throw new IllegalArgumentException(
                                        "Refund reason cannot exceed 500 characters");
                }

                Refund refund = new Refund();

                refund.setPayment(payment);
                refund.setBooking(booking);
                refund.setAmount(payment.getAmount());
                refund.setStatus(RefundStatus.PENDING);
                refund.setReason(cleanedReason);

                return refundRepository.save(refund);
        }

        // =========================================================
        // GET TRAVELER REFUND
        // =========================================================

        public Refund getTravelerRefund(
                        Long bookingId,
                        Long userId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                // Verify that the booking belongs to this traveler
                if (booking.getUser() == null
                                || !booking.getUser()
                                                .getId()
                                                .equals(userId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to view this refund");
                }

                return refundRepository
                                .findByBookingId(bookingId)
                                .orElse(null);
        }

        // =========================================================
        // COMPLETE REFUND
        // =========================================================

        public Refund completeRefund(
                        Long refundId,
                        String refundReference,
                        Long ownerId) {

                Refund refund = refundRepository.findById(refundId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Refund not found"));

                Booking booking = refund.getBooking();

                // Verify that the refund belongs to this owner
                if (booking == null
                                || booking.getRoom() == null
                                || booking.getRoom().getProperty() == null
                                || booking.getRoom()
                                                .getProperty()
                                                .getOwner() == null
                                || !booking.getRoom()
                                                .getProperty()
                                                .getOwner()
                                                .getId()
                                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to manage this refund");
                }

                if (refund.getStatus() != RefundStatus.PENDING) {
                        throw new IllegalArgumentException(
                                        "Only pending refunds can be completed");
                }

                if (refundReference == null
                                || refundReference.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Refund reference is required");
                }

                String cleanedReference = refundReference.trim();

                if (cleanedReference.length() > 100) {
                        throw new IllegalArgumentException(
                                        "Refund reference cannot exceed 100 characters");
                }

                // =====================================================
                // MARK REFUND AS COMPLETED
                // =====================================================

                refund.setRefundReference(
                                cleanedReference);

                refund.setStatus(
                                RefundStatus.COMPLETED);

                refund.setProcessedAt(
                                LocalDateTime.now());

                Refund savedRefund = refundRepository.save(refund);

                // =====================================================
                // MARK PAYMENT AS REFUNDED
                // =====================================================

                Payment payment = refund.getPayment();

                payment.setStatus(
                                PaymentStatus.REFUNDED);

                paymentRepository.save(payment);

                // =====================================================
                // SEND REFUND EMAIL + PDF SLIP
                // =====================================================

                try {

                        if (booking.getUser() != null
                                        && booking.getUser().getEmail() != null
                                        && !booking.getUser()
                                                        .getEmail()
                                                        .isBlank()) {

                                byte[] refundSlip = refundSlipService
                                                .generateRefundSlip(
                                                                savedRefund);

                                emailService.sendRefundCompletedEmail(
                                                booking.getUser().getEmail(),
                                                booking.getUser().getName(),
                                                savedRefund,
                                                refundSlip);
                        }

                } catch (Exception emailError) {

                        System.err.println(
                                        "Refund completed successfully, "
                                                        + "but refund email could not be sent: "
                                                        + emailError.getMessage());
                }

                return savedRefund;
        }

        // =========================================================
        // FAIL REFUND
        // =========================================================

        public Refund failRefund(
                        Long refundId,
                        String reason,
                        Long ownerId) {

                Refund refund = refundRepository.findById(refundId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Refund not found"));

                Booking booking = refund.getBooking();

                // Verify that the refund belongs to this owner
                if (booking == null
                                || booking.getRoom() == null
                                || booking.getRoom().getProperty() == null
                                || booking.getRoom().getProperty().getOwner() == null
                                || !booking.getRoom()
                                                .getProperty()
                                                .getOwner()
                                                .getId()
                                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to manage this refund");
                }

                if (refund.getStatus() != RefundStatus.PENDING) {
                        throw new IllegalArgumentException(
                                        "Only pending refunds can be failed");
                }

                if (reason == null
                                || reason.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Failure reason is required");
                }

                String cleanedReason = reason.trim();

                if (cleanedReason.length() > 500) {
                        throw new IllegalArgumentException(
                                        "Failure reason cannot exceed 500 characters");
                }

                refund.setStatus(
                                RefundStatus.FAILED);

                refund.setReason(
                                cleanedReason);

                return refundRepository.save(refund);
        }

        public List<Refund> getOwnerRefunds(
                        Long ownerId) {

                return refundRepository
                                .findByBookingRoomPropertyOwnerIdOrderByCreatedAtDesc(
                                                ownerId);
        }
}