package com.stayby.backend.repository;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

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

    List<Booking> findByRoomPropertyOwnerIdOrderByCreatedAtDesc(
            Long ownerId
    );
}