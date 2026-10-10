package com.stayby.backend.controller;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.UserRepository;
import com.stayby.backend.service.AdminService;
import com.stayby.backend.entity.Review;
import com.stayby.backend.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

public AdminController(
        AdminService adminService,
        UserRepository userRepository,
        PropertyRepository propertyRepository,
        BookingRepository bookingRepository,
        ReviewRepository reviewRepository
) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard() {

        return ResponseEntity.ok(
                adminService.getDashboardStats()
        );
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {

        List<Map<String, Object>> users =
                userRepository.findAll()
                        .stream()
                        .map(this::toUserResponse)
                        .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/properties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllProperties() {

        List<Map<String, Object>> properties =
                propertyRepository.findAll()
                        .stream()
                        .map(this::toPropertyResponse)
                        .toList();

        return ResponseEntity.ok(properties);
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {

        List<Map<String, Object>> bookings =
                bookingRepository.findAll()
                        .stream()
                        .map(this::toBookingResponse)
                        .toList();

        return ResponseEntity.ok(bookings);
    }

    private Map<String, Object> toUserResponse(User user) {

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "createdAt", user.getCreatedAt()
        );
    }

    private Map<String, Object> toPropertyResponse(Property property) {

        Map<String, Object> response = new HashMap<>();

        response.put("id", property.getId());
        response.put("name", property.getName());
        response.put("description", property.getDescription());
        response.put("propertyType", property.getPropertyType());
        response.put("address", property.getAddress());
        response.put("city", property.getCity());
        response.put("latitude", property.getLatitude());
        response.put("longitude", property.getLongitude());
        response.put("verified", property.isVerified());
        response.put("createdAt", property.getCreatedAt());

        response.put("ownerId", property.getOwner().getId());
        response.put("ownerName", property.getOwner().getName());
        response.put("ownerEmail", property.getOwner().getEmail());

        return response;
    }

    private Map<String, Object> toBookingResponse(Booking booking) {

        Map<String, Object> response = new HashMap<>();

        response.put("id", booking.getId());
        response.put("checkIn", booking.getCheckIn());
        response.put("checkOut", booking.getCheckOut());
        response.put("guests", booking.getGuests());
        response.put("totalPrice", booking.getTotalPrice());
        response.put("status", booking.getStatus().name());
        response.put("rejectionReason", booking.getRejectionReason());
        response.put("createdAt", booking.getCreatedAt());

        response.put("travelerId", booking.getUser().getId());
        response.put("travelerName", booking.getUser().getName());
        response.put("travelerEmail", booking.getUser().getEmail());

        response.put("roomId", booking.getRoom().getId());
        response.put("roomName", booking.getRoom().getName());

        response.put(
                "propertyId",
                booking.getRoom().getProperty().getId()
        );

        response.put(
                "propertyName",
                booking.getRoom().getProperty().getName()
        );

        return response;
    }
    
    // =========================================================
    // ADMIN - REVIEWS
    // =========================================================

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllReviews() {

        List<Map<String, Object>> reviews =
                reviewRepository.findAll()
                        .stream()
                        .map(this::toReviewResponse)
                        .toList();

        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long id
    ) {

        Review review = reviewRepository.findById(id)
                .orElse(null);

        if (review == null) {
            return ResponseEntity
                    .status(404)
                    .body(Map.of(
                            "message",
                            "Review not found"
                    ));
        }

        reviewRepository.delete(review);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Review deleted successfully"
                )
        );
    }

    private Map<String, Object> toReviewResponse(
            Review review
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                review.getId()
        );

        response.put(
                "propertyId",
                review.getProperty().getId()
        );

        response.put(
                "propertyName",
                review.getProperty().getName()
        );

        response.put(
                "travelerId",
                review.getUser().getId()
        );

        response.put(
                "travelerName",
                review.getUser().getName()
        );

        response.put(
                "travelerEmail",
                review.getUser().getEmail()
        );

        response.put(
                "bookingId",
                review.getBooking().getId()
        );

        response.put(
                "rating",
                review.getRating()
        );

        response.put(
                "comment",
                review.getComment()
        );

        response.put(
                "createdAt",
                review.getCreatedAt()
        );

        return response;
    }

}
