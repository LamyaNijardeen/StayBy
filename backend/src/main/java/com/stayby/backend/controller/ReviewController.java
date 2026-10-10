package com.stayby.backend.controller;

import com.stayby.backend.dto.ReviewResponse;
import com.stayby.backend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // =========================================================
    // CREATE REVIEW
    // =========================================================

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<?> createReview(
            @PathVariable Long bookingId,
            @RequestParam Long propertyId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            ReviewResponse review =
                    reviewService.createReview(
                            bookingId,
                            propertyId,
                            rating,
                            comment,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(review);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET REVIEWS FOR PROPERTY
    // =========================================================

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getPropertyReviews(
            @PathVariable Long propertyId
    ) {

        try {

            List<ReviewResponse> reviews =
                    reviewService.getPropertyReviews(
                            propertyId
                    );

            return ResponseEntity.ok(
                    reviews
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET REVIEW FOR BOOKING
    // =========================================================

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getReviewForBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            ReviewResponse review =
                    reviewService.getReviewForBooking(
                            bookingId,
                            userId
                    );

            return ResponseEntity.ok(
                    review
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}