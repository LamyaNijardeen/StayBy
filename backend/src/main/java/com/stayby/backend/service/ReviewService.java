package com.stayby.backend.service;

import com.stayby.backend.dto.ReviewResponse;
import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.Review;
import com.stayby.backend.entity.Role;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.ReviewRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

  public ReviewService(
        ReviewRepository reviewRepository,
        BookingRepository bookingRepository,
        PropertyRepository propertyRepository,
        UserRepository userRepository,
        NotificationService notificationService
) {
    this.reviewRepository = reviewRepository;
    this.bookingRepository = bookingRepository;
    this.propertyRepository = propertyRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
}

    // =========================================================
    // CREATE REVIEW
    // =========================================================

    public ReviewResponse createReview(
            Long bookingId,
            Long propertyId,
            Integer rating,
            String comment,
            Long userId
    ) {

        // -----------------------------------------------------
        // Validate rating
        // -----------------------------------------------------

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5"
            );
        }

        // -----------------------------------------------------
        // Find current user
        // -----------------------------------------------------

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        // -----------------------------------------------------
        // Only travelers can submit reviews
        // -----------------------------------------------------

        if (user.getRole() != Role.TRAVELER) {
            throw new IllegalArgumentException(
                    "Only travelers can submit reviews"
            );
        }

        // -----------------------------------------------------
        // Find booking
        // -----------------------------------------------------

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Booking not found"
                        )
                );

        // -----------------------------------------------------
        // Check booking belongs to current traveler
        // -----------------------------------------------------

        if (!booking.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You are not authorized to review this booking"
            );
        }

        // -----------------------------------------------------
        // Only completed bookings can be reviewed
        // -----------------------------------------------------

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "Only completed bookings can be reviewed"
            );
        }

        // -----------------------------------------------------
        // Check booking property
        // -----------------------------------------------------

        Long bookingPropertyId =
                booking.getRoom()
                        .getProperty()
                        .getId();

        if (!bookingPropertyId.equals(propertyId)) {
            throw new IllegalArgumentException(
                    "The booking does not belong to this property"
            );
        }

        // -----------------------------------------------------
        // Check if booking already has a review
        // -----------------------------------------------------

        if (reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new IllegalArgumentException(
                    "This booking has already been reviewed"
            );
        }

        // -----------------------------------------------------
        // Find property
        // -----------------------------------------------------

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Property not found"
                        )
                );

        // -----------------------------------------------------
        // Clean comment
        // -----------------------------------------------------

        String cleanedComment = null;

        if (comment != null) {

            cleanedComment = comment.trim();

            if (cleanedComment.length() > 2000) {
                throw new IllegalArgumentException(
                        "Review cannot exceed 2000 characters"
                );
            }

            if (cleanedComment.isEmpty()) {
                cleanedComment = null;
            }
        }

        // -----------------------------------------------------
        // Create review
        // -----------------------------------------------------

        Review review = new Review();

        review.setUser(user);
        review.setProperty(property);
        review.setBooking(booking);
        review.setRating(rating);
        review.setComment(cleanedComment);

     Review savedReview =
        reviewRepository.save(review);

// Notify property owner
notificationService.createNotification(
        property.getOwner(),
        "NEW_REVIEW",
        "New review received",
        user.getName()
                + " left a "
                + rating
                + "-star review for "
                + property.getName(),
        property.getId()
);

return ReviewResponse.fromEntity(
        savedReview
);
    }

    // =========================================================
    // GET REVIEWS FOR PROPERTY
    // =========================================================

    public List<ReviewResponse> getPropertyReviews(
            Long propertyId
    ) {

        return reviewRepository
                .findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    // =========================================================
    // GET REVIEW FOR BOOKING
    // =========================================================

    public ReviewResponse getReviewForBooking(
            Long bookingId,
            Long userId
    ) {

        Review review = reviewRepository
                .findByBookingId(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Review not found"
                        )
                );

        if (!review.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You are not authorized to view this review"
            );
        }

        return ReviewResponse.fromEntity(
                review
        );
    }

    // =========================================================
    // ADMIN - GET ALL REVIEWS
    // =========================================================

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // =========================================================
    // ADMIN - DELETE REVIEW
    // =========================================================

    public void deleteReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Review not found"
                        )
                );

        reviewRepository.delete(review);
    }


}