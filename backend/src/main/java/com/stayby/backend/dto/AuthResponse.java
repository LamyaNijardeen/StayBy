package com.stayby.backend.dto;

import com.stayby.backend.entity.Role;

public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(
            Long id,
            String name,
            String email,
            Role role,
            String token
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
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

    public Role getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}