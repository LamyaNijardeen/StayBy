package com.stayby.backend.entity;

import jakarta.persistence.*;

/**
 * An important place near a property (hospital, university, beach...).
 * distanceKm is the straight-line distance from the property.
 */
@Entity
@Table(
        name = "property_landmarks",
        indexes = {
                @Index(name = "idx_landmark_property", columnList = "property_id")
        })
public class PropertyLandmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 200)
    private String name;

    // Hospital, Education, Tourist place, Beach, Transport, Religious, Shopping
    @Column(nullable = false, length = 60)
    private String category;

    private Double latitude;

    private Double longitude;

    @Column(nullable = false)
    private Double distanceKm;

    public PropertyLandmark() {
    }

    public PropertyLandmark(
            Property property,
            String name,
            String category,
            Double latitude,
            Double longitude,
            Double distanceKm) {
        this.property = property;
        this.name = name;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
    }

    public Long getId() {
        return id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }
}