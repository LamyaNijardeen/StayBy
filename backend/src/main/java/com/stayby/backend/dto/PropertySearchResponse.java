package com.stayby.backend.dto;

import java.util.List;
import java.util.Set;

public class PropertySearchResponse {

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
    private List<RoomResponse> availableRooms;
    private Set<String> suitablePurposes;

    public PropertySearchResponse() {
    }

    public PropertySearchResponse(
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
            List<RoomResponse> availableRooms,
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
        this.availableRooms = availableRooms;
        this.suitablePurposes = suitablePurposes;
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

    public List<RoomResponse> getAvailableRooms() {
        return availableRooms;
    }

    public Set<String> getSuitablePurposes() {
        return suitablePurposes;
    }
}
