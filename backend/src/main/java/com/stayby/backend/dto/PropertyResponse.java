package com.stayby.backend.dto;

import com.stayby.backend.entity.Property;

import java.util.Set;

public class PropertyResponse {

    private Long id;
    private String name;
    private String description;
    private String propertyType;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private boolean verified;
    private PropertyOwnerResponse owner;
    private Set<String> suitablePurposes;

    public PropertyResponse() {
    }

    public PropertyResponse(
            Long id,
            String name,
            String description,
            String propertyType,
            String address,
            String city,
            Double latitude,
            Double longitude,
            boolean verified,
            PropertyOwnerResponse owner,
            Set<String> suitablePurposes
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.propertyType = propertyType;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.verified = verified;
        this.owner = owner;
        this.suitablePurposes = suitablePurposes;
    }

    public static PropertyResponse fromEntity(Property property) {

        PropertyOwnerResponse owner = new PropertyOwnerResponse(
                property.getOwner().getId(),
                property.getOwner().getName(),
                property.getOwner().getEmail()
        );

        return new PropertyResponse(
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
                property.getSuitablePurposes()
        );
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

    public PropertyOwnerResponse getOwner() {
        return owner;
    }

    public Set<String> getSuitablePurposes() {
        return suitablePurposes;
    }
}

