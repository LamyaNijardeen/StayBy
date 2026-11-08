package com.stayby.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.stayby.backend.dto.RoomResponse;
import com.stayby.backend.entity.Room;
import com.stayby.backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(
            @PathVariable Long propertyId
    ) {

        List<RoomResponse> rooms =
                roomService.getRoomsByProperty(propertyId)
                        .stream()
                        .map(RoomResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @PathVariable Long propertyId
    ) {

        List<RoomResponse> rooms =
                roomService.getAvailableRoomsByProperty(propertyId)
                        .stream()
                        .map(RoomResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(
            @PathVariable Long propertyId,
            @PathVariable Long roomId
    ) {

        try {

            Room room = roomService.getRoomById(roomId);

            if (!room.getProperty().getId().equals(propertyId)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Room not found");
            }

            return ResponseEntity.ok(
                    RoomResponse.fromEntity(room)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ResponseEntity<?> createRoom(
            @PathVariable Long propertyId,
            @RequestBody Room room,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Room savedRoom =
                    roomService.createRoom(
                            propertyId,
                            room,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            RoomResponse.fromEntity(savedRoom)
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{roomId}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            @RequestBody Room room,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Room existingRoom =
                    roomService.getRoomById(roomId);

            if (!existingRoom.getProperty().getId().equals(propertyId)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Room not found");
            }

            Room updatedRoom =
                    roomService.updateRoom(
                            roomId,
                            room,
                            userId
                    );

            return ResponseEntity.ok(
                    RoomResponse.fromEntity(updatedRoom)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> deleteRoom(
            @PathVariable Long propertyId,
            @PathVariable Long roomId,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Room room =
                    roomService.getRoomById(roomId);

            if (!room.getProperty().getId().equals(propertyId)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Room not found");
            }

            roomService.deleteRoom(
                    roomId,
                    userId
            );

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }
    @GetMapping("/available-dates")
public ResponseEntity<?> getAvailableRoomsForDates(
        @PathVariable Long propertyId,
        @RequestParam LocalDate checkIn,
        @RequestParam LocalDate checkOut,
        @RequestParam Integer guests
) {

    try {

        List<RoomResponse> rooms =
                roomService.getAvailableRoomsForDates(
                        propertyId,
                        checkIn,
                        checkOut,
                        guests
                )
                .stream()
                .map(RoomResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(rooms);

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
}