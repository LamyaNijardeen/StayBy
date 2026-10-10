package com.stayby.backend.controller;

import com.stayby.backend.dto.PropertyImageResponse;
import com.stayby.backend.entity.PropertyImage;
import com.stayby.backend.service.PropertyImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/properties/{propertyId}/images")
public class PropertyImageController {

        private final PropertyImageService propertyImageService;

        public PropertyImageController(
                        PropertyImageService propertyImageService) {
                this.propertyImageService = propertyImageService;
        }

        @PostMapping
        public ResponseEntity<?> uploadImage(
                        @PathVariable Long propertyId,
                        @RequestParam("file") MultipartFile file,
                        Authentication authentication) {

                try {

                        Long userId = Long.valueOf(
                                        authentication.getName());

                        PropertyImage image = propertyImageService.uploadImage(
                                        propertyId,
                                        file,
                                        userId);

                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(
                                                        PropertyImageResponse.fromEntity(image));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(e.getMessage());

                } catch (IOException e) {

                        return ResponseEntity
                                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to upload image");
                }
        }

        @GetMapping
        public ResponseEntity<?> getPropertyImages(
                        @PathVariable Long propertyId) {

                try {

                        List<PropertyImage> images = propertyImageService.getPropertyImages(
                                        propertyId);

                        return ResponseEntity.ok(images);

                } catch (IllegalArgumentException e) {

                        return ResponseEntity
                                        .status(HttpStatus.NOT_FOUND)
                                        .body(e.getMessage());
                }
        }

        @DeleteMapping("/{imageId}")
        public ResponseEntity<?> deleteImage(
                        @PathVariable Long propertyId,
                        @PathVariable Long imageId,
                        Authentication authentication) {

                try {

                        Long userId = Long.valueOf(
                                        authentication.getName());

                        propertyImageService.deleteImage(
                                        imageId,
                                        userId);

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
                                        .body("Failed to delete image");
                }
        }
}
