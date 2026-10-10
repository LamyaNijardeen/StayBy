package com.stayby.backend.dto;

public class PropertyOwnerResponse {

    private Long id;
    private String name;
    private String email;

    public PropertyOwnerResponse() {
    }

    public PropertyOwnerResponse(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
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