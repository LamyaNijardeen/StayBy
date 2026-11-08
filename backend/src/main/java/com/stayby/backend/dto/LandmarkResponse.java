package com.stayby.backend.dto;

import com.stayby.backend.entity.PropertyLandmark;

public class LandmarkResponse {

    private Long id;
    private String name;
    private String category;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;

    public LandmarkResponse() {
    }

    public LandmarkResponse(
            Long id,
            String name,
            String category,
            Double latitude,
            Double longitude,
            Double distanceKm) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
    }

    public static LandmarkResponse fromEntity(PropertyLandmark landmark) {
        return new LandmarkResponse(
                landmark.getId(),
                landmark.getName(),
                landmark.getCategory(),
                landmark.getLatitude(),
                landmark.getLongitude(),
                landmark.getDistanceKm());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }
}