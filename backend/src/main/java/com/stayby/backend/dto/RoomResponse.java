package com.stayby.backend.dto;

import com.stayby.backend.entity.Room;

public class RoomResponse {

    private Long id;
    private Long propertyId;
    private String name;
    private String description;
    private Double pricePerNight;
    private Integer capacity;
    private boolean available;

    public RoomResponse() {
    }

    public RoomResponse(
            Long id,
            Long propertyId,
            String name,
            String description,
            Double pricePerNight,
            Integer capacity,
            boolean available
    ) {
        this.id = id;
        this.propertyId = propertyId;
        this.name = name;
        this.description = description;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.available = available;
    }

    public static RoomResponse fromEntity(Room room) {

        return new RoomResponse(
                room.getId(),
                room.getProperty().getId(),
                room.getName(),
                room.getDescription(),
                room.getPricePerNight(),
                room.getCapacity(),
                room.isAvailable()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getPricePerNight() {
        return pricePerNight;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public boolean isAvailable() {
        return available;
    }
}