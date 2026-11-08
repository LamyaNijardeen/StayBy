package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Room;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.RoomRepository;
import com.stayby.backend.repository.UserRepository;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import com.stayby.backend.entity.Refund;
import com.stayby.backend.entity.RefundStatus;
import com.stayby.backend.repository.RefundRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

        private final BookingRepository bookingRepository;
        private final RoomRepository roomRepository;
        private final UserRepository userRepository;
        private final PaymentRepository paymentRepository;
        private final RefundRepository refundRepository;
        private final NotificationService notificationService;
        private final EmailService emailService;

        /*
         * Booking statuses that keep a room reserved.
         *
         * AWAITING_PAYMENT must be included: the owner has already
         * approved the booking and the traveler is paying for it.
         * REJECTED, CANCELLED and COMPLETED bookings do NOT block a room.
         */
        public static final List<BookingStatus> BLOCKING_STATUSES = List.of(
                        BookingStatus.PENDING,
                        BookingStatus.AWAITING_PAYMENT,
                        BookingStatus.CONFIRMED);

        public BookingService(
                        BookingRepository bookingRepository,
                        RoomRepository roomRepository,
                        UserRepository userRepository,
                        PaymentRepository paymentRepository,
                        RefundRepository refundRepository,
                        NotificationService notificationService,
                        EmailService emailService) {

                this.bookingRepository = bookingRepository;
                this.roomRepository = roomRepository;
                this.userRepository = userRepository;
                this.paymentRepository = paymentRepository;
                this.refundRepository = refundRepository;
                this.notificationService = notificationService;
                this.emailService = emailService;
        }
        // =========================================================
        // CREATE BOOKING
        // =========================================================

        public Booking createBooking(
                        Long roomId,
                        LocalDate checkIn,
                        LocalDate checkOut,
                        Integer guests,
                        String purpose,
                        Long userId) {

                if (checkIn == null || checkOut == null) {
                        throw new IllegalArgumentException(
                                        "Check-in and check-out dates are required");
                }

                if (!checkOut.isAfter(checkIn)) {
                        throw new IllegalArgumentException(
                                        "Check-out date must be after check-in date");
                }

                if (guests == null || guests <= 0) {
                        throw new IllegalArgumentException(
                                        "Guests must be greater than zero");
                }

                if (purpose == null || purpose.trim().isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Purpose of stay is required");
                }

                String cleanedPurpose = purpose.trim();

                if (cleanedPurpose.length() > 150) {
                        throw new IllegalArgumentException(
                                        "Purpose of stay cannot exceed 150 characters");
                }

                Room room = roomRepository.findById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                // =========================================================
                // PROPERTY VERIFICATION CHECK
                // =========================================================

                if (!room.getProperty().isVerified()
                                || !room.getProperty().isListed()) {

                        throw new IllegalArgumentException(
                                        "This property is not available for booking");
                }

                if (!room.isAvailable()) {
                        throw new IllegalArgumentException(
                                        "Room is currently unavailable");
                }

                if (guests > room.getCapacity()) {
                        throw new IllegalArgumentException(
                                        "Number of guests exceeds room capacity");

                }

                /*
                 * Find bookings whose dates overlap:
                 *
                 * existing.checkIn < requested.checkOut
                 * AND
                 * existing.checkOut > requested.checkIn
                 *
                 * Only PENDING, AWAITING_PAYMENT and CONFIRMED bookings
                 * block the room (see BLOCKING_STATUSES).
                 */
                boolean hasActiveOverlap = !bookingRepository
                                .findOverlappingBookingsByStatus(
                                                roomId,
                                                checkIn,
                                                checkOut,
                                                BLOCKING_STATUSES)
                                .isEmpty();

                if (hasActiveOverlap) {
                        throw new IllegalArgumentException(
                                        "Room is already booked for the selected dates");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                long nights = ChronoUnit.DAYS.between(
                                checkIn,
                                checkOut);

                double totalPrice = nights * room.getPricePerNight();

                Booking booking = new Booking();

                booking.setRoom(room);
                booking.setUser(user);

                booking.setCheckIn(checkIn);
                booking.setCheckOut(checkOut);
                booking.setGuests(guests);
                booking.setPurpose(cleanedPurpose);
                booking.setTotalPrice(totalPrice);
                booking.setStatus(BookingStatus.PENDING);

                Booking savedBooking = bookingRepository.save(booking);

                // Notify property owner
                notificationService.createNotification(
                                room.getProperty().getOwner(),
                                "NEW_BOOKING",
                                "New booking request",
                                user.getName()
                                                + " submitted a booking request for "
                                                + room.getProperty().getName(),
                                savedBooking.getId());

                return savedBooking;
        }

        // =========================================================
        // GET MY BOOKINGS
        // =========================================================

        public List<Booking> getMyBookings(Long userId) {

                return bookingRepository
                                .findByUserIdOrderByCreatedAtDesc(userId);
        }

        // =========================================================
        // GET SINGLE BOOKING
        // =========================================================

        public Booking getBookingById(
                        Long bookingId,
                        Long userId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                if (!booking.getUser().getId().equals(userId)) {
                        throw new IllegalArgumentException(
                                        "You are not authorized to view this booking");
                }

                return booking;
        }

// =========================================================
// CANCEL BOOKING
// =========================================================

public Booking cancelBooking(
                Long bookingId,
                Long userId) {

        Booking booking = getBookingById(bookingId, userId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new IllegalArgumentException(
                                "Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
                throw new IllegalArgumentException(
                                "Completed booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking =
                        bookingRepository.save(booking);

        // =========================================================
        // CREATE REFUND REQUEST IF PAYMENT WAS ALREADY COMPLETED
        // =========================================================

        Payment payment =
                        paymentRepository
                                        .findByBookingId(bookingId)
                                        .orElse(null);

        // An unpaid payment (waiting for approval, or awaiting a
        // PayHere result) can no longer be approved once the
        // booking is cancelled.
        if (payment != null
                        && payment.getStatus() == PaymentStatus.PENDING) {

                payment.setStatus(PaymentStatus.FAILED);
                payment.setRejectionReason("Booking was cancelled");

                paymentRepository.save(payment);
        }

        if (payment != null
                        && payment.getStatus() == PaymentStatus.PAID
                        && !refundRepository.existsByPaymentId(
                                        payment.getId())) {

                Refund refund = new Refund();

                refund.setPayment(payment);
                refund.setBooking(savedBooking);
                refund.setAmount(payment.getAmount());
                refund.setStatus(RefundStatus.PENDING);
                refund.setReason(
                                "Booking cancelled by traveler"
                );

                Refund savedRefund =
                                refundRepository.save(refund);

                // Notify owner that a refund needs to be processed
                notificationService.createNotification(
                                booking.getRoom()
                                                .getProperty()
                                                .getOwner(),
                                "REFUND_REQUESTED",
                                "Refund requested",
                                "Booking #"
                                                + booking.getId()
                                                + " was cancelled by the traveler. "
                                                + "A refund of "
                                                + savedRefund.getAmount()
                                                + " is pending.",
                                booking.getId());

                // Notify traveler that refund processing is pending
                notificationService.createNotification(
                                booking.getUser(),
                                "REFUND_REQUESTED",
                                "Refund requested",
                                "Your booking #"
                                                + booking.getId()
                                                + " has been cancelled. "
                                                + "A refund of "
                                                + savedRefund.getAmount()
                                                + " is now pending processing.",
                                booking.getId());
        }

        // =========================================================
        // NOTIFY PROPERTY OWNER OF CANCELLATION
        // =========================================================

        notificationService.createNotification(
                        booking.getRoom()
                                        .getProperty()
                                        .getOwner(),
                        "BOOKING_CANCELLED",
                        "Booking cancelled",
                        booking.getUser().getName()
                                        + " cancelled booking #"
                                        + booking.getId(),
                        booking.getId());

        return savedBooking;
}
        // =========================================================
        // GET OWNER BOOKINGS
        // =========================================================

        public List<Booking> getOwnerBookings(Long ownerId) {

                return bookingRepository
                                .findByRoomPropertyOwnerIdOrderByCreatedAtDesc(ownerId);
        }

        // =========================================================
        // CONFIRM BOOKING
        // =========================================================

        public Booking confirmBooking(
                        Long bookingId,
                        Long ownerId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                // -----------------------------------------------------
                // Check ownership
                // -----------------------------------------------------

                if (!booking.getRoom()
                                .getProperty()
                                .getOwner()
                                .getId()
                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to manage this booking");
                }

                // -----------------------------------------------------
                // Only PENDING bookings can be confirmed
                // -----------------------------------------------------

                if (booking.getStatus() == BookingStatus.CANCELLED) {
                        throw new IllegalArgumentException(
                                        "Cancelled booking cannot be confirmed");
                }

                if (booking.getStatus() == BookingStatus.REJECTED) {
                        throw new IllegalArgumentException(
                                        "Rejected booking cannot be confirmed");
                }

                if (booking.getStatus() == BookingStatus.COMPLETED) {
                        throw new IllegalArgumentException(
                                        "Completed booking cannot be confirmed");
                }

                if (booking.getStatus() == BookingStatus.CONFIRMED) {
                        throw new IllegalArgumentException(
                                        "Booking is already confirmed");
                }

                // -----------------------------------------------------
                // Re-check date availability before confirming.
                //
                // IMPORTANT:
                // checkIn and checkOut must NOT be reversed.
                // -----------------------------------------------------

                boolean hasAnotherActiveBooking = bookingRepository
                                .findOverlappingBookingsByStatus(
                                                booking.getRoom().getId(),
                                                booking.getCheckIn(),
                                                booking.getCheckOut(),
                                                BLOCKING_STATUSES)
                                .stream()
                                .anyMatch(otherBooking -> !otherBooking.getId()
                                                .equals(booking.getId()));

                if (hasAnotherActiveBooking) {
                        throw new IllegalArgumentException(
                                        "This room is no longer available for the selected dates");
                }

                // -----------------------------------------------------
                // Move booking to payment stage
                // -----------------------------------------------------

                booking.setStatus(BookingStatus.AWAITING_PAYMENT);

                // Make sure an old rejection reason is not retained
                booking.setRejectionReason(null);

                Booking savedBooking = bookingRepository.save(booking);
                Payment payment = new Payment();

                payment.setBooking(savedBooking);
                payment.setAmount(savedBooking.getTotalPrice());
                payment.setStatus(PaymentStatus.PENDING);

                paymentRepository.save(payment);

                // Notify traveler that payment is now required
                String paymentMessage = "Your booking at "
                                + booking.getRoom().getProperty().getName()
                                + " has been approved by the owner. "
                                + "Please complete the payment to confirm your booking. "
                                + "Room: "
                                + booking.getRoom().getName()
                                + ". Check-in: "
                                + booking.getCheckIn()
                                + ". Check-out: "
                                + booking.getCheckOut()
                                + ".";

                notificationService.createNotification(
                                booking.getUser(),
                                "PAYMENT_REQUIRED",
                                "Payment required",
                                paymentMessage,
                                savedBooking.getId());

                return savedBooking;
        }

        // =========================================================
        // OWNER - GET SINGLE BOOKING
        // =========================================================

        public Booking getOwnerBookingById(
                        Long bookingId,
                        Long ownerId) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                if (!booking.getRoom()
                                .getProperty()
                                .getOwner()
                                .getId()
                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to view this booking");
                }

                return booking;
        }
        // =========================================================
        // REJECT BOOKING
        // =========================================================

        public Booking rejectBooking(
                        Long bookingId,
                        Long ownerId,
                        String rejectionReason) {

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found"));

                // -----------------------------------------------------
                // Check ownership
                // -----------------------------------------------------

                if (!booking.getRoom()
                                .getProperty()
                                .getOwner()
                                .getId()
                                .equals(ownerId)) {

                        throw new IllegalArgumentException(
                                        "You are not authorized to manage this booking");
                }

                // -----------------------------------------------------
                // Validate rejection reason
                // -----------------------------------------------------

                if (rejectionReason == null ||
                                rejectionReason.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "A rejection reason is required");
                }

                String cleanedReason = rejectionReason.trim();

                if (cleanedReason.length() > 500) {
                        throw new IllegalArgumentException(
                                        "Rejection reason cannot exceed 500 characters");
                }

                // -----------------------------------------------------
                // Only PENDING bookings can be rejected
                // -----------------------------------------------------

                if (booking.getStatus() == BookingStatus.CONFIRMED) {
                        throw new IllegalArgumentException(
                                        "Confirmed booking cannot be rejected");
                }

                if (booking.getStatus() == BookingStatus.REJECTED) {
                        throw new IllegalArgumentException(
                                        "Booking is already rejected");
                }

                if (booking.getStatus() == BookingStatus.CANCELLED) {
                        throw new IllegalArgumentException(
                                        "Cancelled booking cannot be rejected");
                }

                if (booking.getStatus() == BookingStatus.COMPLETED) {
                        throw new IllegalArgumentException(
                                        "Completed booking cannot be rejected");
                }

                // -----------------------------------------------------
                // Reject booking
                // -----------------------------------------------------

                booking.setStatus(BookingStatus.REJECTED);
                booking.setRejectionReason(cleanedReason);

                Booking savedBooking = bookingRepository.save(booking);

                // Notify traveler
                notificationService.createNotification(
                                booking.getUser(),
                                "BOOKING_REJECTED",
                                "Booking rejected",
                                "Your booking at "
                                                + booking.getRoom()
                                                                .getProperty()
                                                                .getName()
                                                + " was rejected. Reason: "
                                                + cleanedReason,
                                savedBooking.getId());

                return savedBooking;
        }

        // =========================================================
        // ADMIN - GET ALL BOOKINGS
        // =========================================================

        public List<Booking> getAllBookings() {

                return bookingRepository.findAll();
        }
}