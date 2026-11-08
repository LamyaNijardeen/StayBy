package com.stayby.backend.service;

import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.PropertyImage;
import com.stayby.backend.repository.PropertyImageRepository;
import com.stayby.backend.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PropertyImageService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/property-images");

    public PropertyImageService(
            PropertyImageRepository propertyImageRepository,
            PropertyRepository propertyRepository
    ) {
        this.propertyImageRepository = propertyImageRepository;
        this.propertyRepository = propertyRepository;
    }

    public PropertyImage uploadImage(
            Long propertyId,
            MultipartFile file,
            Long userId
    ) throws IOException {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Property not found")
                );

        if (!property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to add images to this property"
            );
        }

        UploadValidator.Checked checked =
                UploadValidator.check(file, false);

        Files.createDirectories(uploadDirectory);

        String filename =
                UUID.randomUUID() + checked.extension();

        Path filePath =
                uploadDirectory.resolve(filename);

        Files.write(filePath, checked.bytes());

        PropertyImage propertyImage =
                new PropertyImage(
                        property,
                        "/uploads/property-images/" + filename
                );

        return propertyImageRepository.save(propertyImage);
    }

    public List<PropertyImage> getPropertyImages(
            Long propertyId
    ) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new IllegalArgumentException(
                    "Property not found"
            );
        }

        return propertyImageRepository
                .findByPropertyId(propertyId);
    }

    public void deleteImage(
            Long imageId,
            Long userId
    ) throws IOException {

        PropertyImage image =
                propertyImageRepository.findById(imageId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Image not found"
                                )
                        );

        Property property = image.getProperty();

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

        propertyImageRepository.delete(image);
    }
}