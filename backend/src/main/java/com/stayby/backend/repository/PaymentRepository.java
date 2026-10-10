package com.stayby.backend.repository;

import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentId(String paymentId);

    boolean existsByBookingId(Long bookingId);

    long countByStatus(PaymentStatus status);
}