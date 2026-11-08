package com.stayby.backend.dto;

import com.stayby.backend.entity.Favorite;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.User;

import java.time.LocalDateTime;

/*
 * Safe response for a favorite.
 *
 * The Favorite ENTITY must never be returned directly because it
 * contains the full User entity (password hash, bank details, ...)
 * and the property owner's User entity as well.
 *
 * The JSON shape matches FavoriteResponse in
 * frontend/src/services/propertyService.ts.
 */
public class FavoriteResponse {

    private Long id;
    private UserSummary user;
    private PropertySummary property;
    private LocalDateTime createdAt;

    public FavoriteResponse() {
    }

    public static FavoriteResponse fromEntity(Favorite favorite) {

        FavoriteResponse response = new FavoriteResponse();

        response.id = favorite.getId();
        response.user = UserSummary.fromEntity(favorite.getUser());
        response.property = PropertySummary.fromEntity(favorite.getProperty());
        response.createdAt = favorite.getCreatedAt();

        return response;
    }

    public Long getId() {
        return id;
    }

    public UserSummary getUser() {
        return user;
    }

    public PropertySummary getProperty() {
        return property;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =========================================================
    // USER SUMMARY (id, name, email only)
    // =========================================================

    public static class UserSummary {

        private Long id;
        private String name;
        private String email;

        public static UserSummary fromEntity(User user) {

            UserSummary summary = new UserSummary();

            summary.id = user.getId();
            summary.name = user.getName();
            summary.email = user.getEmail();

            return summary;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }

    // =========================================================
    // PROPERTY SUMMARY (no owner, no images)
    // =========================================================

    public static class PropertySummary {

        private Long id;
        private String name;
        private String description;
        private String propertyType;
        private String address;
        private String city;
        private Double latitude;
        private Double longitude;
        private boolean verified;

        public static PropertySummary fromEntity(Property property) {

            PropertySummary summary = new PropertySummary();

            summary.id = property.getId();
            summary.name = property.getName();
            summary.description = property.getDescription();
            summary.propertyType = property.getPropertyType();
            summary.address = property.getAddress();
            summary.city = property.getCity();
            summary.latitude = property.getLatitude();
            summary.longitude = property.getLongitude();
            summary.verified = property.isVerified();

            return summary;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        public String getPropertyType() {
            return propertyType;
        }

        public String getAddress() {
            return address;
        }

        public String getCity() {
            return city;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public boolean isVerified() {
            return verified;
        }
    }
}