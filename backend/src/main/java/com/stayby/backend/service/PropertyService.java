package com.stayby.backend.service;

import com.stayby.backend.dto.PropertyOwnerResponse;
import com.stayby.backend.dto.PropertySearchResponse;
import com.stayby.backend.dto.RoomResponse;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.Room;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final RoomService roomService;

    public PropertyService(
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            RoomService roomService
    ) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.roomService = roomService;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

public List<Property> searchProperties(
        String city,
        String propertyType,
        Boolean verified
) {

    // =========================================================
    // VERIFIED PROPERTY SEARCH
    // =========================================================

    if (Boolean.TRUE.equals(verified)) {

        if (city != null && propertyType != null) {

            return propertyRepository
                    .findByCityIgnoreCaseAndPropertyTypeIgnoreCaseAndVerifiedTrue(
                            city,
                            propertyType
                    );
        }

        if (city != null) {

            return propertyRepository
                    .findByCityIgnoreCaseAndVerifiedTrue(city);
        }

        if (propertyType != null) {

            return propertyRepository
                    .findByPropertyTypeIgnoreCase(propertyType)
                    .stream()
                    .filter(Property::isVerified)
                    .toList();
        }

        return propertyRepository.findByVerifiedTrue();
    }

    // =========================================================
    // NON-VERIFIED / ADMIN-SIDE GENERAL SEARCH
    // =========================================================

    if (city != null && propertyType != null) {

        return propertyRepository
                .findByCityIgnoreCaseAndPropertyTypeIgnoreCase(
                        city,
                        propertyType
                );
    }

    if (propertyType != null) {

        return propertyRepository
                .findByPropertyTypeIgnoreCase(propertyType);
    }

    if (city != null) {

        return propertyRepository
                .findByCityIgnoreCase(city);
    }

    return propertyRepository.findAll();
}

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Property not found")
                );
    }
    public Property getPropertyByIdForViewer(
        Long id,
        Long authenticatedUserId,
        boolean isAdmin
) {

    Property property = propertyRepository.findById(id)
            .orElseThrow(() ->
                    new IllegalArgumentException("Property not found")
            );

    // ---------------------------------------------------------
    // VERIFIED PROPERTY
    // ---------------------------------------------------------
    // Anyone can view a verified property.
    if (property.isVerified()) {
        return property;
    }

    // ---------------------------------------------------------
    // UNVERIFIED PROPERTY
    // ---------------------------------------------------------
    // Admin can view any property.
    if (isAdmin) {
        return property;
    }

    // Owner can view their own unverified property.
    if (authenticatedUserId != null
            && property.getOwner().getId().equals(authenticatedUserId)) {

        return property;
    }

    // Everyone else cannot view an unverified property.
    throw new IllegalArgumentException("Property not found");
}

    public Property createProperty(Property property, Long userId) {

        User owner = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        property.setOwner(owner);
        property.setVerified(false);

        if (property.getSuitablePurposes() == null) {
            property.setSuitablePurposes(new java.util.HashSet<>());
        }

        return propertyRepository.save(property);
    }

    public Property updateProperty(
            Long id,
            Property updatedProperty,
            Long userId
    ) {

        Property existingProperty = getPropertyById(id);

        checkOwnership(existingProperty, userId);

        existingProperty.setName(updatedProperty.getName());
        existingProperty.setDescription(updatedProperty.getDescription());
        existingProperty.setPropertyType(updatedProperty.getPropertyType());
        existingProperty.setAddress(updatedProperty.getAddress());
        existingProperty.setCity(updatedProperty.getCity());
        existingProperty.setLatitude(updatedProperty.getLatitude());
        existingProperty.setLongitude(updatedProperty.getLongitude());

        if (updatedProperty.getSuitablePurposes() != null) {
            existingProperty.setSuitablePurposes(
                    updatedProperty.getSuitablePurposes()
            );
        } else {
            existingProperty.setSuitablePurposes(
                    new java.util.HashSet<>()
            );
        }

        return propertyRepository.save(existingProperty);
    }

    public void deleteProperty(Long id, Long userId) {

        Property property = getPropertyById(id);

        checkOwnership(property, userId);

        propertyRepository.delete(property);
    }

    public List<PropertySearchResponse> searchAvailableProperties(
            String city,
            String propertyType,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests,
            String purpose
    ) {

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

        List<Property> properties =
                searchProperties(city, propertyType, true);

        /*
         * Filter properties according to the traveler's purpose.
         *
         * The comparison is case-insensitive so that:
         * "Tour / Vacation"
         * and
         * "tour / vacation"
         * are treated as the same purpose.
         */
        if (purpose != null && !purpose.trim().isEmpty()) {

            String cleanedPurpose = purpose.trim();

            properties = properties.stream()
                    .filter(property ->
                            property.getSuitablePurposes() != null
                                    && property.getSuitablePurposes()
                                    .stream()
                                    .anyMatch(
                                            propertyPurpose ->
                                                    propertyPurpose != null
                                                            && propertyPurpose.equalsIgnoreCase(
                                                            cleanedPurpose
                                                    )
                                    )
                    )
                    .toList();
        }

        List<PropertySearchResponse> results =
                new ArrayList<>();

        for (Property property : properties) {

            List<Room> availableRooms =
                    roomService.getAvailableRoomsForDates(
                            property.getId(),
                            checkIn,
                            checkOut,
                            guests
                    );

            if (!availableRooms.isEmpty()) {

                PropertyOwnerResponse owner =
                        new PropertyOwnerResponse(
                                property.getOwner().getId(),
                                property.getOwner().getName(),
                                property.getOwner().getEmail()
                        );

                List<RoomResponse> roomResponses =
                        availableRooms.stream()
                                .map(RoomResponse::fromEntity)
                                .toList();

                results.add(
                        new PropertySearchResponse(
                                property.getId(),
                                property.getName(),
                                property.getDescription(),
                                property.getPropertyType(),
                                property.getAddress(),
                                property.getCity(),
                                property.getLatitude(),
                                property.getLongitude(),
                                property.isVerified(),
                                owner,
                                roomResponses,
                                property.getSuitablePurposes()
                        )
                );
            }
        }

        return results;
    }

    private void checkOwnership(
            Property property,
            Long userId
    ) {

        if (!property.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to modify this property"
            );
        }
    }

    public Property verifyProperty(Long id) {

        Property property = getPropertyById(id);

        property.setVerified(true);

        return propertyRepository.save(property);
    }

    public Property rejectProperty(Long id) {

        Property property = getPropertyById(id);

        property.setVerified(false);

        return propertyRepository.save(property);
    }
}
