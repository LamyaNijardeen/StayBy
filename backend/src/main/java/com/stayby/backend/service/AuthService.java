package com.stayby.backend.service;

import com.stayby.backend.dto.AuthResponse;
import com.stayby.backend.dto.LoginRequest;
import com.stayby.backend.dto.RegisterRequest;
import com.stayby.backend.entity.Role;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.UserRepository;
import com.stayby.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private static final int VERIFICATION_CODE_EXPIRATION_MINUTES = 10;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Transactional
    public User register(RegisterRequest request) {

        String email = request.getEmail().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.TRAVELER);

        // New accounts must verify their email.
        user.setEmailVerified(false);

        // Generate a new 6-digit verification code.
        String verificationCode = generateVerificationCode();

        // Never store the actual code in the database.
        user.setVerificationCodeHash(
                passwordEncoder.encode(verificationCode)
        );

        user.setVerificationCodeExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(VERIFICATION_CODE_EXPIRATION_MINUTES)
        );

        User savedUser = userRepository.save(user);

        // Send the actual verification email.
        emailService.sendVerificationCode(
                savedUser.getEmail(),
                savedUser.getName(),
                verificationCode
        );

        return savedUser;
    }

    // =========================================================
    // VERIFY EMAIL
    // =========================================================

    @Transactional
    public void verifyEmail(
            String email,
            String verificationCode
    ) {

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Account not found"
                        )
                );

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Email is already verified"
            );
        }

        if (user.getVerificationCodeHash() == null
                || user.getVerificationCodeExpiresAt() == null) {

            throw new IllegalArgumentException(
                    "No verification code found. Please request a new code."
            );
        }

        if (LocalDateTime.now()
                .isAfter(user.getVerificationCodeExpiresAt())) {

            throw new IllegalArgumentException(
                    "Verification code has expired. Please request a new code."
            );
        }

        if (!passwordEncoder.matches(
                verificationCode,
                user.getVerificationCodeHash()
        )) {
            throw new IllegalArgumentException(
                    "Invalid verification code"
            );
        }

        // Verification successful.
        user.setEmailVerified(true);

        // Remove the used verification code.
        user.setVerificationCodeHash(null);
        user.setVerificationCodeExpiresAt(null);

        userRepository.save(user);
    }

    // =========================================================
    // RESEND VERIFICATION CODE
    // =========================================================

    @Transactional
    public void resendVerificationCode(String email) {

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Account not found"
                        )
                );

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Email is already verified"
            );
        }

        // Generate a completely new code.
        String verificationCode = generateVerificationCode();

        user.setVerificationCodeHash(
                passwordEncoder.encode(verificationCode)
        );

        user.setVerificationCodeExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(VERIFICATION_CODE_EXPIRATION_MINUTES)
        );

        userRepository.save(user);

        emailService.sendVerificationCode(
                user.getEmail(),
                user.getName(),
                verificationCode
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail().trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        // Do not issue a JWT to an unverified account.
        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before signing in."
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }

    // =========================================================
    // GENERATE 6-DIGIT CODE
    // =========================================================

    private String generateVerificationCode() {

        int code = secureRandom.nextInt(1_000_000);

        return String.format("%06d", code);
    }

    // =========================================================
    // TEMPORARY OWNER PASSWORD RESET
    // =========================================================

    @Transactional
    public void resetOwnerPassword() {

        User user = userRepository
                .findByEmail("owner@stayby.com")
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Owner account not found"
                        )
                );

        user.setPassword(
                passwordEncoder.encode("Owner1234")
        );

        userRepository.save(user);
    }
}

