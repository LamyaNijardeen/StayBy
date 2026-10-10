package com.stayby.backend.dto;

import com.stayby.backend.entity.RoomImage;

public class RoomImageResponse {

    private Long id;
    private String imageUrl;

    public RoomImageResponse() {
    }

    public RoomImageResponse(Long id, String imageUrl) {
        this.id = id;
        this.imageUrl = imageUrl;
    }

    public static RoomImageResponse fromEntity(RoomImage image) {
        return new RoomImageResponse(
                image.getId(),
                image.getImageUrl()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}