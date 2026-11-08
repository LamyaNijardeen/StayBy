package com.stayby.backend.repository;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** True when any room of this property has ever been booked. */
    boolean existsByRoomPropertyId(Long propertyId);

    List<Booking> findByRoomIdAndStatusIn(
            Long roomId,
            List<BookingStatus> statuses
    );

    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.checkIn < :checkOut
        AND b.checkOut > :checkIn
    """)
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    /*
     * Overlapping bookings that currently block the room
     * (filtered by status in the database).
     */
    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.checkIn < :checkOut
        AND b.checkOut > :checkIn
        AND b.status IN :statuses
    """)
    List<Booking> findOverlappingBookingsByStatus(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    /*
     * Used by the completion scheduler so it does not
     * need to load every booking in the database.
     */
    List<Booking> findByStatusAndCheckOutBefore(
            BookingStatus status,
            LocalDate date
    );

    /** Used by the expiry scheduler (unanswered requests). */
    List<Booking> findByStatusAndCreatedAtBefore(
            BookingStatus status,
            java.time.LocalDateTime time
    );

    /** Used by the expiry scheduler (approved but never paid). */
    List<Booking> findByStatusAndUpdatedAtBefore(
            BookingStatus status,
            java.time.LocalDateTime time
    );

    List<Booking> findByRoomPropertyOwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );
}