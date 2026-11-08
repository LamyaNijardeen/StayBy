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
    private Set<String> amenities;
    private List<LandmarkResponse> nearbyLandmarks;
    private LandmarkResponse matchedLandmark;
    private boolean relevant;

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
            Set<String> suitablePurposes,
            Set<String> amenities
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
        this.amenities = amenities;
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

    public Set<String> getAmenities() {
        return amenities;
    }

    public List<LandmarkResponse> getNearbyLandmarks() {
        return nearbyLandmarks;
    }

    public void setNearbyLandmarks(List<LandmarkResponse> nearbyLandmarks) {
        this.nearbyLandmarks = nearbyLandmarks;
    }

    public LandmarkResponse getMatchedLandmark() {
        return matchedLandmark;
    }

    public void setMatchedLandmark(LandmarkResponse matchedLandmark) {
        this.matchedLandmark = matchedLandmark;
    }

    /** true when the stay satisfies everything the traveler typed. */
    public boolean isRelevant() {
        return relevant;
    }

    public void setRelevant(boolean relevant) {
        this.relevant = relevant;
    }
}