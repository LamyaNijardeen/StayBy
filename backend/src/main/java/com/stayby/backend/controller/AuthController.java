package com.stayby.backend.controller;

import com.stayby.backend.dto.AuthResponse;
import com.stayby.backend.dto.LoginRequest;
import com.stayby.backend.dto.RegisterRequest;
import com.stayby.backend.entity.User;
import com.stayby.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        try {

            User user = authService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message",
                                    "Registration successful. Please check your email for the verification code.",
                                    "email",
                                    user.getEmail()
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // VERIFY EMAIL
    // =========================================================

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestParam String email,
            @RequestParam String code
    ) {

        try {

            authService.verifyEmail(email, code);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Email verified successfully. You can now sign in."
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // RESEND VERIFICATION CODE
    // =========================================================

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationCode(
            @RequestParam String email
    ) {

        try {

            authService.resendVerificationCode(email);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "A new verification code has been sent to your email."
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    authService.login(request)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    /*
     * TEMPORARY DEVELOPMENT ENDPOINT
     *
     * Used only to reset the Test Owner password.
     * Remove this endpoint after the owner login has been tested.
     */
    @PostMapping("/reset-owner-password")
    public ResponseEntity<?> resetOwnerPassword() {

        try {

            authService.resetOwnerPassword();

            return ResponseEntity.ok(
                    "Owner password reset successfully"
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}

