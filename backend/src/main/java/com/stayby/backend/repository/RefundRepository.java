package com.stayby.backend.repository;

import com.stayby.backend.entity.Refund;
import com.stayby.backend.entity.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefundRepository
        extends JpaRepository<Refund, Long> {

    Optional<Refund> findByPaymentId(Long paymentId);

    Optional<Refund> findByBookingId(Long bookingId);

    boolean existsByPaymentId(Long paymentId);

    long countByStatus(RefundStatus status);

    List<Refund> findByBookingRoomPropertyOwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );
}