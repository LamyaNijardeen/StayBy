package com.stayby.backend.controller;

import com.stayby.backend.entity.User;
import com.stayby.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return ResponseEntity.ok(
                Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "phone",
                        user.getPhone() == null
                                ? ""
                                : user.getPhone(),
                        "role", user.getRole().name()
                )
        );
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        String phone = request.get("phone");

        if (phone != null) {

            phone = phone.trim();

            if (!phone.isEmpty()) {

                boolean validSriLankanPhone =
                        phone.matches(
                                "^(0\\d{9}|\\+94\\d{9})$"
                        );

                if (!validSriLankanPhone) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    Map.of(
                                            "message",
                                            "Please enter a valid Sri Lankan phone number."
                                    )
                            );
                }
            }

            user.setPhone(
                    phone.isEmpty()
                            ? null
                            : phone
            );
        }

        User savedUser =
                userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "id", savedUser.getId(),
                        "name", savedUser.getName(),
                        "email", savedUser.getEmail(),
                        "phone",
                        savedUser.getPhone() == null
                                ? ""
                                : savedUser.getPhone(),
                        "role",
                        savedUser.getRole().name()
                )
        );
    }
}