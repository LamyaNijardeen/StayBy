package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.Role;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.RoomRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public AdminService(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            RoomRepository roomRepository,
            BookingRepository bookingRepository
    ) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    public Map<String, Object> getDashboardStats() {

        // =========================
        // USERS
        // =========================

        List<User> users = userRepository.findAll();

        long totalUsers = users.size();

        long totalTravelers = users.stream()
                .filter(user -> user.getRole() == Role.TRAVELER)
                .count();

        long totalOwners = users.stream()
                .filter(user -> user.getRole() == Role.OWNER)
                .count();

        long totalAdmins = users.stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .count();


        // =========================
        // PROPERTIES
        // =========================

        List<Property> properties = propertyRepository.findAll();

        long totalProperties = properties.size();

        long verifiedProperties = properties.stream()
                .filter(Property::isVerified)
                .count();

        long pendingProperties = properties.stream()
                .filter(property -> !property.isVerified())
                .count();


        // =========================
        // ROOMS
        // =========================

        long totalRooms = roomRepository.count();


        // =========================
        // BOOKINGS
        // =========================

        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();

        long pendingBookings = countBookingsByStatus(
                bookings,
                BookingStatus.PENDING
        );

        long confirmedBookings = countBookingsByStatus(
                bookings,
                BookingStatus.CONFIRMED
        );

        long completedBookings = countBookingsByStatus(
                bookings,
                BookingStatus.COMPLETED
        );

        long cancelledBookings = countBookingsByStatus(
                bookings,
                BookingStatus.CANCELLED
        );

        long rejectedBookings = countBookingsByStatus(
                bookings,
                BookingStatus.REJECTED
        );


        // =========================
        // RESPONSE
        // =========================

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", totalUsers);
        stats.put("totalTravelers", totalTravelers);
        stats.put("totalOwners", totalOwners);
        stats.put("totalAdmins", totalAdmins);

        stats.put("totalProperties", totalProperties);
        stats.put("verifiedProperties", verifiedProperties);
        stats.put("pendingProperties", pendingProperties);

        stats.put("totalRooms", totalRooms);

        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        stats.put("rejectedBookings", rejectedBookings);

        return stats;
    }


    private long countBookingsByStatus(
            List<Booking> bookings,
            BookingStatus status
    ) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == status)
                .count();
    }
}