package com.stayby.backend.controller;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class TravelerPaymentController {

        private final BookingRepository bookingRepository;

        public TravelerPaymentController(
                        BookingRepository bookingRepository) {
                this.bookingRepository = bookingRepository;
        }

        // =========================================================
        // GET OWNER BANK DETAILS FOR A BOOKING
        // =========================================================

        @GetMapping("/booking/{bookingId}/bank-details")
        public ResponseEntity<?> getBankDetailsForBooking(
                        @PathVariable Long bookingId,
                        Authentication authentication) {

                Long travelerId;

                try {
                        travelerId = Long.valueOf(authentication.getName());
                } catch (NumberFormatException e) {
                        return ResponseEntity.status(401)
                                        .body(Map.of("message", "Invalid authentication"));
                }

                Booking booking = bookingRepository.findById(bookingId)
                                .orElse(null);

                if (booking == null) {
                        return ResponseEntity.status(404)
                                        .body(Map.of("message", "Booking not found"));
                }

                // ---------------------------------------------------------
                // Make sure this booking belongs to the logged-in traveler
                // ---------------------------------------------------------

                if (!booking.getUser().getId().equals(travelerId)) {
                        return ResponseEntity.status(403)
                                        .body(Map.of(
                                                        "message",
                                                        "You are not authorized to view payment details for this booking"));
                }

                // ---------------------------------------------------------
                // Bank transfer payment is available while awaiting payment
                // ---------------------------------------------------------

                if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        "Payment details are available only when the booking is awaiting payment"));
                }

                // ---------------------------------------------------------
                // Get the property owner
                // Booking -> Room -> Property -> Owner
                // ---------------------------------------------------------

                var owner = booking.getRoom()
                                .getProperty()
                                .getOwner();

                // ---------------------------------------------------------
                // Check whether owner has configured bank details
                // ---------------------------------------------------------

                if (owner.getBankName() == null
                                || owner.getBankName().trim().isEmpty()
                                || owner.getBankAccountName() == null
                                || owner.getBankAccountName().trim().isEmpty()
                                || owner.getBankAccountNumber() == null
                                || owner.getBankAccountNumber().trim().isEmpty()
                                || owner.getBankBranch() == null
                                || owner.getBankBranch().trim().isEmpty()) {

                        return ResponseEntity.badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        "The property owner has not configured bank transfer details yet"));
                }

                // ---------------------------------------------------------
                // Return owner's bank details
                // ---------------------------------------------------------

                return ResponseEntity.ok(
                                Map.of(
                                                "bookingId", booking.getId(),
                                                "propertyName",
                                                booking.getRoom().getProperty().getName(),
                                                "bankName", owner.getBankName(),
                                                "accountName", owner.getBankAccountName(),
                                                "accountNumber", owner.getBankAccountNumber(),
                                                "branch", owner.getBankBranch(),
                                                "amount", booking.getTotalPrice()));
        }
}