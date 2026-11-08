package com.stayby.backend.service;

import com.stayby.backend.dto.LandmarkResponse;
import com.stayby.backend.dto.PropertyOwnerResponse;
import com.stayby.backend.dto.PropertySearchResponse;
import com.stayby.backend.dto.RoomResponse;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.PropertyImage;
import com.stayby.backend.entity.RoomImage;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.FavoriteRepository;
import com.stayby.backend.repository.PropertyImageRepository;
import com.stayby.backend.repository.RoomImageRepository;
import com.stayby.backend.repository.RoomRepository;
import org.springframework.transaction.annotation.Transactional;
import com.stayby.backend.entity.Room;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.PropertyLandmarkRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class PropertyService {

        private final PropertyRepository propertyRepository;
        private final UserRepository userRepository;
        private final RoomService roomService;
        private final LandmarkService landmarkService;
        private final PropertyLandmarkRepository landmarkRepository;
        private final BookingRepository bookingRepository;
        private final FavoriteRepository favoriteRepository;
        private final RoomRepository roomRepository;
        private final RoomImageRepository roomImageRepository;
        private final PropertyImageRepository propertyImageRepository;

        public PropertyService(
                        PropertyRepository propertyRepository,
                        UserRepository userRepository,
                        RoomService roomService,
                        LandmarkService landmarkService,
                        PropertyLandmarkRepository landmarkRepository,
                        BookingRepository bookingRepository,
                        FavoriteRepository favoriteRepository,
                        RoomRepository roomRepository,
                        RoomImageRepository roomImageRepository,
                        PropertyImageRepository propertyImageRepository) {
                this.propertyRepository = propertyRepository;
                this.userRepository = userRepository;
                this.roomService = roomService;
                this.landmarkService = landmarkService;
                this.landmarkRepository = landmarkRepository;
                this.bookingRepository = bookingRepository;
                this.favoriteRepository = favoriteRepository;
                this.roomRepository = roomRepository;
                this.roomImageRepository = roomImageRepository;
                this.propertyImageRepository = propertyImageRepository;
        }

        public List<Property> getAllProperties() {
                return propertyRepository.findAll();
        }

        /** Verified, listed (not hidden by the owner) and owner not suspended. */
        private boolean isPubliclyVisible(Property property) {
                return property.isVerified()
                                && property.isListed()
                                && !property.getOwner().isSuspended();
        }

        public List<Property> searchProperties(
                        String city,
                        String propertyType,
                        Boolean verified) {

                List<Property> result = searchPropertiesRaw(city, propertyType, verified);

                if (Boolean.TRUE.equals(verified)) {
                        return result.stream()
                                        .filter(this::isPubliclyVisible)
                                        .toList();
                }

                return result;
        }

        private List<Property> searchPropertiesRaw(
                        String city,
                        String propertyType,
                        Boolean verified) {

                // =========================================================
                // VERIFIED PROPERTY SEARCH
                // =========================================================

                if (Boolean.TRUE.equals(verified)) {

                        if (city != null && propertyType != null) {

                                return propertyRepository
                                                .findByCityIgnoreCaseAndPropertyTypeIgnoreCaseAndVerifiedTrue(
                                                                city,
                                                                propertyType);
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
                                                        propertyType);
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
                                .orElseThrow(() -> new IllegalArgumentException("Property not found"));
        }

        public Property getPropertyByIdForViewer(
                        Long id,
                        Long authenticatedUserId,
                        boolean isAdmin) {

                Property property = propertyRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

                // ---------------------------------------------------------
                // VERIFIED PROPERTY
                // ---------------------------------------------------------
                // Anyone can view a verified property.
                if (isPubliclyVisible(property)) {
                        return property;
                }

                // ---------------------------------------------------------
                // UNVERIFIED / HIDDEN PROPERTY
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

        public Property setListed(Long id, Long userId, boolean listed) {

                Property property = propertyRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

                if (!property.getOwner().getId().equals(userId)) {
                        throw new IllegalArgumentException(
                                        "You are not authorized to change this property");
                }

                property.setListed(listed);

                return propertyRepository.save(property);
        }

        public Property createProperty(Property property, Long userId) {

                User owner = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                property.setOwner(owner);
                property.setVerified(false);

                if (property.getSuitablePurposes() == null) {
                        property.setSuitablePurposes(new java.util.HashSet<>());
                }
                if (property.getAmenities() == null) {
                        property.setAmenities(new java.util.HashSet<>());
                }

                Property saved = propertyRepository.save(property);

                refreshLandmarksInBackground(saved);

                return saved;
        }

        /*
         * Looks up nearby hospitals, universities, beaches... in the
         * background so that saving a property is never slowed down or
         * broken by the map service.
         */
        private void refreshLandmarksInBackground(Property property) {

                if (property.getLatitude() == null
                                || property.getLongitude() == null) {
                        return;
                }

                Long propertyId = property.getId();

                CompletableFuture.runAsync(
                                () -> landmarkService.refreshQuietly(propertyId));
        }

        public Property updateProperty(
                        Long id,
                        Property updatedProperty,
                        Long userId) {

                Property existingProperty = getPropertyById(id);

                checkOwnership(existingProperty, userId);

                boolean locationChanged = !java.util.Objects.equals(
                                existingProperty.getLatitude(),
                                updatedProperty.getLatitude())
                                || !java.util.Objects.equals(
                                                existingProperty.getLongitude(),
                                                updatedProperty.getLongitude());

                existingProperty.setName(updatedProperty.getName());
                existingProperty.setDescription(updatedProperty.getDescription());
                existingProperty.setPropertyType(updatedProperty.getPropertyType());
                existingProperty.setAddress(updatedProperty.getAddress());
                existingProperty.setCity(updatedProperty.getCity());
                existingProperty.setLatitude(updatedProperty.getLatitude());
                existingProperty.setLongitude(updatedProperty.getLongitude());

                if (updatedProperty.getSuitablePurposes() != null) {
                        existingProperty.setSuitablePurposes(
                                        updatedProperty.getSuitablePurposes());
                } else {
                        existingProperty.setSuitablePurposes(
                                        new java.util.HashSet<>());
                }
                if (updatedProperty.getAmenities() != null) {
                        existingProperty.setAmenities(
                                        updatedProperty.getAmenities());
                }

                Property saved = propertyRepository.save(existingProperty);

                // Re-detect nearby places when the location moved, or when
                // this property has none yet (e.g. it was added before
                // this feature existed).
                if (locationChanged
                                || landmarkRepository
                                                .findByPropertyIdSorted(saved.getId())
                                                .isEmpty()) {
                        refreshLandmarksInBackground(saved);
                }

                return saved;
        }

        /**
         * Deletes a property together with everything that only exists
         * for it (rooms, photos, favourites, nearby places).
         *
         * A property that has ever been booked cannot be deleted: its
         * bookings, payments, refunds and reviews must be kept as records.
         */
        @Transactional
        public void deleteProperty(Long id, Long userId) {

                Property property = getPropertyById(id);

                checkOwnership(property, userId);

                if (bookingRepository.existsByRoomPropertyId(id)) {
                        throw new IllegalStateException(
                                        "This property has booking history, so it cannot be deleted "
                                                        + "(the booking and payment records must be kept). "
                                                        + "You can mark its rooms as unavailable instead.");
                }

                List<Room> rooms = roomRepository.findByPropertyId(id);

                for (Room room : rooms) {

                        List<RoomImage> roomImages = roomImageRepository.findByRoomId(room.getId());

                        for (RoomImage image : roomImages) {
                                deleteUploadedFile("uploads/room-images", image.getImageUrl());
                        }

                        roomImageRepository.deleteAll(roomImages);
                }

                roomRepository.deleteAll(rooms);

                List<PropertyImage> propertyImages = propertyImageRepository.findByPropertyId(id);

                for (PropertyImage image : propertyImages) {
                        deleteUploadedFile("uploads/property-images", image.getImageUrl());
                }

                propertyImageRepository.deleteAll(propertyImages);

                favoriteRepository.deleteByPropertyId(id);

                landmarkRepository.deleteByPropertyId(id);

                propertyRepository.delete(property);
        }

        /** Removes an uploaded picture from disk; a missing file is not an error. */
        private void deleteUploadedFile(String folder, String imageUrl) {

                if (imageUrl == null || imageUrl.isBlank()) {
                        return;
                }

                try {
                        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

                        java.nio.file.Files.deleteIfExists(
                                        java.nio.file.Paths.get(folder).resolve(filename));
                } catch (Exception ignored) {
                        // The database record is what matters.
                }
        }

        /**
         * Returns EVERY verified stay that can be booked, best matches first.
         *
         * Hard rules (a stay that breaks them cannot be booked):
         * - it has a room for the number of guests
         * - if dates are given, that room is free on those dates
         * - property type, if one is chosen
         *
         * Soft rules (they only decide the order):
         * - city, purpose and landmark. A stay that satisfies everything the
         * traveler typed is marked relevant and listed first; the rest follow,
         * ordered by how many of the typed things they satisfy.
         */
        public List<PropertySearchResponse> searchAvailableProperties(
                        String city,
                        String propertyType,
                        LocalDate checkIn,
                        LocalDate checkOut,
                        Integer guests,
                        String purpose,
                        String landmark) {

                boolean hasDates = checkIn != null && checkOut != null;

                if ((checkIn == null) != (checkOut == null)) {
                        throw new IllegalArgumentException(
                                        "Please choose both check-in and check-out dates");
                }

                if (hasDates && !checkIn.isBefore(checkOut)) {
                        throw new IllegalArgumentException(
                                        "Check-out date must be after check-in date");
                }

                int guestCount = guests == null || guests <= 0 ? 1 : guests;

                boolean hasLandmark = landmark != null && !landmark.isBlank();
                boolean hasCity = city != null && !city.isBlank();
                boolean hasPurpose = purpose != null && !purpose.isBlank();

                List<Property> properties = searchProperties(
                                null,
                                propertyType != null && propertyType.isBlank() ? null : propertyType,
                                true);

                Map<Long, List<LandmarkResponse>> landmarksByProperty = landmarkService
                                .getLandmarksByProperty(
                                                properties.stream()
                                                                .map(Property::getId)
                                                                .toList());

                boolean anyCriteria = hasCity || hasPurpose || hasLandmark;

                List<PropertySearchResponse> results = new ArrayList<>();
                List<Integer> scores = new ArrayList<>();

                for (Property property : properties) {

                        List<Room> rooms = hasDates
                                        ? roomService.getAvailableRoomsForDates(
                                                        property.getId(), checkIn, checkOut, guestCount)
                                        : roomService.getRoomsForGuests(property.getId(), guestCount);

                        if (rooms.isEmpty()) {
                                continue;
                        }

                        List<LandmarkResponse> nearby = landmarksByProperty
                                        .getOrDefault(property.getId(), List.of());

                        LandmarkResponse matched = null;

                        if (hasLandmark) {
                                // nearby is already sorted nearest first
                                for (LandmarkResponse candidate : nearby) {
                                        if (LandmarkService.matches(landmark, candidate)) {
                                                matched = candidate;
                                                break;
                                        }
                                }
                        }

                        boolean landmarkOk = hasLandmark && matched != null;

                        // "Colombo" also matches a stay saved as "Colombo 07".
                        boolean cityOk = hasCity
                                        && property.getCity() != null
                                        && (property.getCity().trim().equalsIgnoreCase(city.trim())
                                                        || property.getCity().trim().toLowerCase()
                                                                        .startsWith(city.trim().toLowerCase() + " "));

                        boolean purposeOk = hasPurpose
                                        && property.getSuitablePurposes() != null
                                        && property.getSuitablePurposes().stream()
                                                        .anyMatch(p -> p != null
                                                                        && p.equalsIgnoreCase(purpose.trim()));

                        // City matters most, then the landmark, then the purpose.
                        // "Colombo" + "hospital" means a hospital in Colombo, so a
                        // stay near a hospital in another city is not a best match.
                        int score = (cityOk ? 4 : 0) + (landmarkOk ? 2 : 0) + (purposeOk ? 1 : 0);

                        PropertyOwnerResponse owner = new PropertyOwnerResponse(
                                        property.getOwner().getId(),
                                        property.getOwner().getName(),
                                        property.getOwner().getEmail(),
                                        property.getOwner().getPhone());

                        List<RoomResponse> roomResponses = rooms.stream()
                                        .map(RoomResponse::fromEntity)
                                        .toList();

                        PropertySearchResponse item = new PropertySearchResponse(
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
                                        property.getSuitablePurposes(),
                                        property.getAmenities());

                        item.setNearbyLandmarks(nearby);
                        item.setMatchedLandmark(matched);
                        item.setRelevant(anyCriteria && cityOk == hasCity && landmarkOk == hasLandmark && purposeOk == hasPurpose);

                        results.add(item);
                        scores.add(score);
                }

                // Best matches first; among stays near a landmark, nearest first.
                // Equal stays keep their original order (stable sort).
                List<Integer> order = new ArrayList<>();
                for (int i = 0; i < results.size(); i++) {
                        order.add(i);
                }

                order.sort(
                                Comparator.<Integer>comparingInt(i -> -scores.get(i))
                                                .thenComparingDouble(i -> {
                                                        LandmarkResponse m = results.get(i).getMatchedLandmark();
                                                        return m == null || m.getDistanceKm() == null
                                                                        ? Double.MAX_VALUE
                                                                        : m.getDistanceKm();
                                                }));

                List<PropertySearchResponse> sorted = new ArrayList<>();
                for (int i : order) {
                        sorted.add(results.get(i));
                }

                return sorted;
        }

        private void checkOwnership(
                        Property property,
                        Long userId) {

                if (!property.getOwner().getId().equals(userId)) {
                        throw new IllegalArgumentException(
                                        "You are not authorized to modify this property");
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