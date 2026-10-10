package com.stayby.backend.dto;

import com.stayby.backend.entity.PropertyImage;

public class PropertyImageResponse {

    private Long id;
    private String imageUrl;

    public PropertyImageResponse() {
    }

    public PropertyImageResponse(Long id, String imageUrl) {
        this.id = id;
        this.imageUrl = imageUrl;
    }

    public static PropertyImageResponse fromEntity(PropertyImage image) {
        return new PropertyImageResponse(
                image.getId(),
                image.getImageUrl()
        );
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
