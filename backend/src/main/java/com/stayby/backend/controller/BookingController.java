package com.stayby.backend.controller;

import com.stayby.backend.dto.BookingResponse;
import com.stayby.backend.entity.Booking;
import com.stayby.backend.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // =========================================================
    // CREATE BOOKING
    // =========================================================

    @PreAuthorize("hasRole('TRAVELER')")
    @PostMapping("/room/{roomId}")
    public ResponseEntity<?> createBooking(
            @PathVariable Long roomId,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut,
            @RequestParam Integer guests,
            @RequestParam String purpose,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.createBooking(
                            roomId,
                            checkIn,
                            checkOut,
                            guests,
                            purpose,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            BookingResponse.fromEntity(booking)
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET MY BOOKINGS
    // =========================================================

    @PreAuthorize("hasRole('TRAVELER')")
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        List<BookingResponse> bookings =
                bookingService.getMyBookings(userId)
                        .stream()
                        .map(BookingResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(bookings);
    }

    // =========================================================
    // GET SINGLE BOOKING
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.getBookingById(
                            id,
                            userId
                    );

            return ResponseEntity.ok(
                    BookingResponse.fromEntity(booking)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // OWNER - GET SINGLE BOOKING
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner/{id}")
    public ResponseEntity<?> getOwnerBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long ownerId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.getOwnerBookingById(
                            id,
                            ownerId
                    );

            return ResponseEntity.ok(
                    BookingResponse.fromEntity(booking)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.cancelBooking(
                            id,
                            userId
                    );

            return ResponseEntity.ok(
                    BookingResponse.fromEntity(booking)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // OWNER - GET BOOKINGS
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner")
    public ResponseEntity<List<BookingResponse>> getOwnerBookings(
            Authentication authentication
    ) {

        Long ownerId = Long.valueOf(
                authentication.getName()
        );

        List<BookingResponse> bookings =
                bookingService.getOwnerBookings(ownerId)
                        .stream()
                        .map(BookingResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(bookings);
    }

    // =========================================================
    // OWNER - CONFIRM BOOKING
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long ownerId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.confirmBooking(
                            id,
                            ownerId
                    );

            return ResponseEntity.ok(
                    BookingResponse.fromEntity(booking)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // OWNER - REJECT BOOKING
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody RejectBookingRequest request,
            Authentication authentication
    ) {

        try {

            Long ownerId = Long.valueOf(
                    authentication.getName()
            );

            Booking booking =
                    bookingService.rejectBooking(
                            id,
                            ownerId,
                            request.getReason()
                    );

            return ResponseEntity.ok(
                    BookingResponse.fromEntity(booking)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // ADMIN - GET ALL BOOKINGS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        List<BookingResponse> bookings =
                bookingService.getAllBookings()
                        .stream()
                        .map(BookingResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(bookings);
    }

    // =========================================================
    // REJECT BOOKING REQUEST
    // =========================================================

    public static class RejectBookingRequest {

        private String reason;

        public RejectBookingRequest() {
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}