package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.repository.BookingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class BookingCompletionScheduler {

    private final BookingRepository bookingRepository;

    public BookingCompletionScheduler(
            BookingRepository bookingRepository
    ) {
        this.bookingRepository = bookingRepository;
    }

    /*
     * Runs every minute.
     *
     * Marks CONFIRMED bookings as COMPLETED once their
     * check-out date has passed. Only the bookings that
     * actually need updating are loaded from the database.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void completeFinishedBookings() {

        List<Booking> finishedBookings =
                bookingRepository.findByStatusAndCheckOutBefore(
                        BookingStatus.CONFIRMED,
                        LocalDate.now()
                );

        if (finishedBookings.isEmpty()) {
            return;
        }

        for (Booking booking : finishedBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
        }

        bookingRepository.saveAll(finishedBookings);

        System.out.println(
                finishedBookings.size()
                        + " booking(s) marked as COMPLETED."
        );
    }
}