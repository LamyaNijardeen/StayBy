package com.stayby.backend.controller;

import com.stayby.backend.dto.RoomImageResponse;
import com.stayby.backend.entity.RoomImage;
import com.stayby.backend.service.RoomImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/rooms/{roomId}/images")
public class RoomImageController {

    private final RoomImageService roomImageService;

    public RoomImageController(
            RoomImageService roomImageService
    ) {
        this.roomImageService = roomImageService;
    }

    /*
     * Upload a room image.
     *
     * POST /api/rooms/{roomId}/images
     *
     * multipart/form-data
     * field name = "file"
     */
    @PostMapping
    public ResponseEntity<?> uploadImage(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            RoomImage image =
                    roomImageService.uploadImage(
                            roomId,
                            file,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            RoomImageResponse.fromEntity(image)
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload room image");
        }
    }

    /*
     * Get all images belonging to a room.
     *
     * GET /api/rooms/{roomId}/images
     */
    @GetMapping
    public ResponseEntity<?> getRoomImages(
            @PathVariable Long roomId
    ) {

        try {

            List<RoomImage> images =
                    roomImageService.getRoomImages(
                            roomId
                    );

            List<RoomImageResponse> response =
                    images.stream()
                            .map(RoomImageResponse::fromEntity)
                            .toList();

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /*
     * Delete a room image.
     *
     * DELETE /api/rooms/{roomId}/images/{imageId}
     */
    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Long roomId,
            @PathVariable Long imageId,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            roomImageService.deleteImage(
                    imageId,
                    userId
            );

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete room image");
        }
    }
}