package com.stayby.backend.repository;

import com.stayby.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Get all reviews for a property
    List<Review> findByPropertyIdOrderByCreatedAtDesc(
            Long propertyId
    );

    // Check whether a traveler has already reviewed a booking
    Optional<Review> findByBookingId(
            Long bookingId
    );

    // Check whether a traveler has already reviewed a property
    boolean existsByUserIdAndPropertyId(
            Long userId,
            Long propertyId
    );
}

