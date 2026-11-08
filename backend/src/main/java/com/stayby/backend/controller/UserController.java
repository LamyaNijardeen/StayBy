package com.stayby.backend.controller;

import com.stayby.backend.entity.User;
import com.stayby.backend.repository.UserRepository;
import com.stayby.backend.service.ProfileImageService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ProfileImageService profileImageService;
    private final PasswordEncoder passwordEncoder;

    // Wrong-current-password attempts: userId -> {count, windowStartMillis}
    private static final int MAX_PASSWORD_ATTEMPTS = 5;
    private static final long ATTEMPT_WINDOW_MS = 15 * 60 * 1000L;
    private final Map<Long, long[]> passwordAttempts =
            new ConcurrentHashMap<>();

    public UserController(
            UserRepository userRepository,
            ProfileImageService profileImageService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.profileImageService = profileImageService;
        this.passwordEncoder = passwordEncoder;
    }

    private Map<String, Object> toResponse(User user) {

        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put(
                "phone",
                user.getPhone() == null ? "" : user.getPhone()
        );
        response.put("role", user.getRole().name());
        response.put(
                "profileImageUrl",
                user.getProfileImageUrl() == null
                        ? ""
                        : user.getProfileImageUrl()
        );

        return response;
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

        return ResponseEntity.ok(toResponse(user));
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

        String name = request.get("name");

        if (name != null) {

            name = name.trim();

            if (name.length() < 2 || name.length() > 100) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Name must be between 2 and 100 characters."
                                )
                        );
            }

            user.setName(name);
        }

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

        return ResponseEntity.ok(toResponse(savedUser));
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @PostMapping("/me/password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        String current = request.get("currentPassword");
        String next = request.get("newPassword");

        if (current == null || current.isEmpty()
                || next == null || next.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Please enter your current and new password."
                    ));
        }

        if (next.length() < 8 || next.length() > 100) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "New password must be between 8 and 100 characters."
                    ));
        }

        long now = System.currentTimeMillis();
        long[] attempts = passwordAttempts.get(userId);

        if (attempts != null
                && now - attempts[1] < ATTEMPT_WINDOW_MS
                && attempts[0] >= MAX_PASSWORD_ATTEMPTS) {

            return ResponseEntity
                    .status(429)
                    .body(Map.of(
                            "message",
                            "Too many wrong attempts. Please try again in 15 minutes."
                    ));
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        if (!passwordEncoder.matches(current, user.getPassword())) {

            if (attempts == null || now - attempts[1] >= ATTEMPT_WINDOW_MS) {
                attempts = new long[] {0, now};
            }

            attempts[0]++;
            passwordAttempts.put(userId, attempts);

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Your current password is incorrect."
                    ));
        }

        if (passwordEncoder.matches(next, user.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Your new password must be different from the current one."
                    ));
        }

        user.setPassword(passwordEncoder.encode(next));
        userRepository.save(user);
        passwordAttempts.remove(userId);

        return ResponseEntity.ok(
                Map.of("message", "Password changed successfully.")
        );
    }

    // =========================================================
    // PROFILE PICTURE
    // =========================================================

    @PostMapping(value = "/me/photo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {

        try {

            User user = profileImageService.upload(
                    Long.valueOf(authentication.getName()),
                    file
            );

            return ResponseEntity.ok(toResponse(user));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("message", "Could not save the picture."));
        }
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<?> removePhoto(
            Authentication authentication
    ) {

        try {

            User user = profileImageService.remove(
                    Long.valueOf(authentication.getName())
            );

            return ResponseEntity.ok(toResponse(user));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}