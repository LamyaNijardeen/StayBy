package com.stayby.backend.service;

import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.Room;
import com.stayby.backend.entity.RoomImage;
import com.stayby.backend.repository.RoomImageRepository;
import com.stayby.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class RoomImageService {

    private final RoomImageRepository roomImageRepository;
    private final RoomRepository roomRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/room-images");

    public RoomImageService(
            RoomImageRepository roomImageRepository,
            RoomRepository roomRepository
    ) {
        this.roomImageRepository = roomImageRepository;
        this.roomRepository = roomRepository;
    }

    public RoomImage uploadImage(
            Long roomId,
            MultipartFile file,
            Long userId
    ) throws IOException {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found")
                );

        Property property = room.getProperty();

        if (!property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to add images to this room"
            );
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename();

        String extension = "";

        if (originalFilename != null &&
                originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String filename =
                UUID.randomUUID() + extension;

        Path filePath =
                uploadDirectory.resolve(filename);

        Files.copy(
                file.getInputStream(),
                filePath
        );

        RoomImage roomImage =
                new RoomImage(
                        room,
                        "/uploads/room-images/" + filename
                );

        return roomImageRepository.save(roomImage);
    }

    public List<RoomImage> getRoomImages(
            Long roomId
    ) {

        if (!roomRepository.existsById(roomId)) {
            throw new IllegalArgumentException(
                    "Room not found"
            );
        }

        return roomImageRepository.findByRoomId(roomId);
    }

    public void deleteImage(
            Long imageId,
            Long userId
    ) throws IOException {

        RoomImage image =
                roomImageRepository.findById(imageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Image not found"
                                )
                        );

        Room room = image.getRoom();

        Property property = room.getProperty();

        if (!property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to delete this image"
            );
        }

        String imageUrl = image.getImageUrl();

        if (imageUrl != null) {

            String filename =
                    imageUrl.substring(
                            imageUrl.lastIndexOf("/") + 1
                    );

            Path filePath =
                    uploadDirectory.resolve(filename);

            Files.deleteIfExists(filePath);
        }

        roomImageRepository.delete(image);
    }
}