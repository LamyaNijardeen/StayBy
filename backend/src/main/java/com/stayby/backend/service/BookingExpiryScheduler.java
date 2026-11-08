package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Frees up rooms that are stuck in limbo:
 *  - PENDING (owner never answered) for too long  -> REJECTED
 *  - AWAITING_PAYMENT (traveler never paid) for too long -> CANCELLED
 */
@Component
public class BookingExpiryScheduler {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Value("${stayby.booking.pending-expiry-hours:48}")
    private long pendingExpiryHours;

    @Value("${stayby.booking.payment-expiry-hours:24}")
    private long paymentExpiryHours;

    public BookingExpiryScheduler(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 300000, initialDelay = 30000)
    @Transactional
    public void expireStaleBookings() {

        LocalDateTime now = LocalDateTime.now();

        // 1. Owner never responded
        for (Booking b : bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING, now.minusHours(pendingExpiryHours))) {

            b.setStatus(BookingStatus.REJECTED);
            b.setRejectionReason(
                    "Expired: the owner did not respond in time.");
            bookingRepository.save(b);

            notificationService.createNotification(
                    b.getUser(),
                    "BOOKING_EXPIRED",
                    "Booking request expired",
                    "Your request for " + b.getRoom().getProperty().getName()
                            + " expired because the owner did not respond in time.",
                    b.getId());
        }

        // 2. Approved, but not paid in time
        for (Booking b : bookingRepository.findByStatusAndUpdatedAtBefore(
                BookingStatus.AWAITING_PAYMENT,
                now.minusHours(paymentExpiryHours))) {

            Payment payment = paymentRepository
                    .findByBookingId(b.getId()).orElse(null);

            if (payment != null) {
                // Never expire a paid booking
                if (payment.getStatus() == PaymentStatus.PAID) {
                    continue;
                }
                // Bank transfer proof waiting for the owner to review
                if (payment.getReceiptSubmittedAt() != null) {
                    continue;
                }
                // Card payment started within the last hour
                if (payment.getUpdatedAt() != null
                        && payment.getUpdatedAt()
                                .isAfter(now.minusHours(1))) {
                    continue;
                }
            }

            b.setStatus(BookingStatus.CANCELLED);
            b.setRejectionReason(
                    "Expired: payment was not completed in time.");
            bookingRepository.save(b);

            String name = b.getRoom().getProperty().getName();

            notificationService.createNotification(
                    b.getUser(),
                    "BOOKING_EXPIRED",
                    "Booking cancelled",
                    "Your booking for " + name
                            + " was cancelled because payment was not completed in time.",
                    b.getId());

            notificationService.createNotification(
                    b.getRoom().getProperty().getOwner(),
                    "BOOKING_EXPIRED",
                    "Booking expired",
                    "Booking #" + b.getId() + " for " + name
                            + " expired because the traveler did not pay in time.",
                    b.getId());
        }
    }
}