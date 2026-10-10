package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.repository.BookingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

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

    @Scheduled(fixedRate = 60000)
    public void completeFinishedBookings() {

        LocalDate today = LocalDate.now();

        System.out.println(
                "Booking completion scheduler running. Today: " + today
        );

        List<Booking> bookings =
                bookingRepository.findAll();

        for (Booking booking : bookings) {

            System.out.println(
                    "Checking booking #" + booking.getId()
                            + " | status=" + booking.getStatus()
                            + " | checkout=" + booking.getCheckOut()
            );

            if (booking.getStatus() == BookingStatus.CONFIRMED
                    && booking.getCheckOut().isBefore(today)) {

                booking.setStatus(BookingStatus.COMPLETED);

                bookingRepository.save(booking);

                System.out.println(
                        "Booking #" + booking.getId()
                                + " changed to COMPLETED."
                );
            }
        }
    }
}