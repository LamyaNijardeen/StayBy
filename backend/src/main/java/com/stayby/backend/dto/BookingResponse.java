package com.stayby.backend.dto;

import com.stayby.backend.entity.Booking;

import java.time.LocalDate;

public class BookingResponse {

    private Long id;
    private Long roomId;
    private String roomName;
    private Long propertyId;
    private String propertyName;

    private String address;
    private String city;
    private Double latitude;
    private Double longitude;

    private String travelerName;
    private String travelerEmail;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private Integer guests;
    private String purpose;
    private Double totalPrice;
    private String status;
    private String rejectionReason;

    public BookingResponse() {
    }

    public BookingResponse(
            Long id,
            Long roomId,
            String roomName,
            Long propertyId,
            String propertyName,
            String address,
            String city,
            Double latitude,
            Double longitude,
            String travelerName,
            String travelerEmail,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests,
            String purpose,
            Double totalPrice,
            String status,
            String rejectionReason
    ) {
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.propertyId = propertyId;
        this.propertyName = propertyName;

        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;

        this.travelerName = travelerName;
        this.travelerEmail = travelerEmail;

        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.guests = guests;
        this.purpose = purpose;
        this.totalPrice = totalPrice;
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public static BookingResponse fromEntity(Booking booking) {

        return new BookingResponse(
                booking.getId(),
                booking.getRoom().getId(),
                booking.getRoom().getName(),
                booking.getRoom().getProperty().getId(),
                booking.getRoom().getProperty().getName(),

                // Property location
                booking.getRoom().getProperty().getAddress(),
                booking.getRoom().getProperty().getCity(),
                booking.getRoom().getProperty().getLatitude(),
                booking.getRoom().getProperty().getLongitude(),

                // Traveler information
                booking.getUser().getName(),
                booking.getUser().getEmail(),

                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getGuests(),
                booking.getPurpose(),
                booking.getTotalPrice(),
                booking.getStatus().name(),
                booking.getRejectionReason()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public String getPropertyName() {
        return propertyName;
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

    public String getTravelerName() {
        return travelerName;
    }

    public String getTravelerEmail() {
        return travelerEmail;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public Integer getGuests() {
        return guests;
    }

    public String getPurpose() {
        return purpose;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}