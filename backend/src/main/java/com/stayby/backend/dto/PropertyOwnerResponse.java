
package com.stayby.backend.dto;

public class PropertyOwnerResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;

    public PropertyOwnerResponse() {
    }

    public PropertyOwnerResponse(
            Long id,
            String name,
            String email,
            String phone
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
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

    public String getPhone() {
        return phone;
    }
}
