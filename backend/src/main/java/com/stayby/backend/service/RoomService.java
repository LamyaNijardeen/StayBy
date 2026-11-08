package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.Room;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;

    public RoomService(
            RoomRepository roomRepository,
            PropertyRepository propertyRepository,
            BookingRepository bookingRepository
    ) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Room> getRoomsByProperty(Long propertyId) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found");
        }

        return roomRepository.findByPropertyId(propertyId);
    }

    public List<Room> getAvailableRoomsByProperty(Long propertyId) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found");
        }

        return roomRepository.findByPropertyIdAndAvailableTrue(propertyId);
    }

    public Room getRoomById(Long id) {

        return roomRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found")
                );
    }

    public Room createRoom(
            Long propertyId,
            Room room,
            Long userId
    ) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Property not found")
                );

        checkOwnership(property, userId);

        room.setProperty(property);
        room.setAvailable(true);

        return roomRepository.save(room);
    }

    public Room updateRoom(
            Long id,
            Room updatedRoom,
            Long userId
    ) {

        Room existingRoom = getRoomById(id);

        checkOwnership(
                existingRoom.getProperty(),
                userId
        );

        existingRoom.setName(updatedRoom.getName());
        existingRoom.setDescription(updatedRoom.getDescription());
        existingRoom.setPricePerNight(updatedRoom.getPricePerNight());
        existingRoom.setCapacity(updatedRoom.getCapacity());
        existingRoom.setAvailable(updatedRoom.isAvailable());

        return roomRepository.save(existingRoom);
    }

    public void deleteRoom(
            Long id,
            Long userId
    ) {

        Room room = getRoomById(id);

        checkOwnership(
                room.getProperty(),
                userId
        );

        roomRepository.delete(room);
    }

    public List<Room> getAvailableRoomsForDates(
            Long propertyId,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests
    ) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException("Property not found");
        }

        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException(
                    "Check-in and check-out dates are required"
            );
        }

        if (!checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException(
                    "Check-out date must be after check-in date"
            );
        }

        if (guests == null || guests <= 0) {
            throw new IllegalArgumentException(
                    "Guests must be greater than 0"
            );
        }

        List<Room> suitableRooms =
                roomRepository
                        .findByPropertyIdAndAvailableTrueAndCapacityGreaterThanEqual(
                                propertyId,
                                guests
                        );

        List<Room> availableRooms = new ArrayList<>();

        for (Room room : suitableRooms) {

            /*
             * Only PENDING, AWAITING_PAYMENT and CONFIRMED bookings
             * block a room. REJECTED, CANCELLED and COMPLETED
             * bookings do not.
             */
            List<Booking> conflictingBookings =
                    bookingRepository.findOverlappingBookingsByStatus(
                            room.getId(),
                            checkIn,
                            checkOut,
                            BookingService.BLOCKING_STATUSES
                    );

            if (conflictingBookings.isEmpty()) {
                availableRooms.add(room);
            }
        }

        return availableRooms;
    }

    /**
     * Rooms that can hold the guests, ignoring dates.
     * Used when the traveler searches without choosing dates.
     */
    public List<Room> getRoomsForGuests(Long propertyId, Integer guests) {

        int needed = guests == null || guests <= 0 ? 1 : guests;

        return roomRepository
                .findByPropertyIdAndAvailableTrueAndCapacityGreaterThanEqual(
                        propertyId,
                        needed
                );
    }

    private void checkOwnership(
            Property property,
            Long userId
    ) {

        if (!property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to modify this room"
            );
        }
    }
}