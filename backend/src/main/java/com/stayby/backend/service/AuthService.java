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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private static final Logger log =
            LoggerFactory.getLogger(AuthService.class);

    private static final int VERIFICATION_CODE_EXPIRATION_MINUTES = 10;

    private static final int RESET_CODE_EXPIRATION_MINUTES = 10;
    private static final int RESET_MAX_ATTEMPTS = 5;
    private static final int RESET_COOLDOWN_SECONDS = 60;

    private final SecureRandom secureRandom = new SecureRandom();

    // Login brute-force protection: after LOGIN_MAX_FAILURES wrong
    // passwords for one email within LOGIN_WINDOW_MS, further attempts are
    // refused until the window ends. Kept in memory (resets on restart).
    private static final int LOGIN_MAX_FAILURES = 5;
    private static final long LOGIN_WINDOW_MS = 15L * 60 * 1000;
    private final ConcurrentHashMap<String, long[]> loginFailures =
            new ConcurrentHashMap<>(); // email -> {count, windowStart}

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

        /*
         * A traveler who registered but never entered the email code has
         * no real account yet. Let them register again with the same
         * email: their unverified record is updated with the new details
         * and a fresh code is sent. Verified accounts (and owners/admins)
         * still cannot be taken over.
         */
        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user != null
                && (user.isEmailVerified()
                        || user.getRole() == Role.ADMIN)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        /*
         * People can register as a traveler or as a property owner.
         * Admin accounts can never be created here. An owner can add
         * properties, but each one stays hidden until an admin verifies it.
         */
        Role requestedRole =
                "OWNER".equalsIgnoreCase(request.getRole())
                        ? Role.OWNER
                        : Role.TRAVELER;

        // Same format as the profile page: 0771234567 or +94771234567
        String phone = request.getPhone() == null
                ? ""
                : request.getPhone().replaceAll("[\\s()\\-]", "");

        if (!phone.isEmpty()
                && !phone.matches("^(0\\d{9}|\\+94\\d{9})$")) {
            throw new IllegalArgumentException(
                    "Please enter a valid Sri Lankan phone number, "
                            + "like 0771234567 or +94771234567"
            );
        }

        if (requestedRole == Role.OWNER && phone.isEmpty()) {
            throw new IllegalArgumentException(
                    "A phone number is required for property owners"
            );
        }

        if (user == null) {
            user = new User();
            user.setEmail(email);
        }

        user.setRole(requestedRole);
        user.setPhone(phone.isEmpty() ? null : phone);

        user.setName(request.getName().trim());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

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

        String key = request.getEmail().trim().toLowerCase();
        long now = System.currentTimeMillis();

        long[] state = loginFailures.get(key);
        if (state != null) {
            if (now - state[1] > LOGIN_WINDOW_MS) {
                loginFailures.remove(key);
            } else if (state[0] >= LOGIN_MAX_FAILURES) {
                long minutes = Math.max(1,
                        (LOGIN_WINDOW_MS - (now - state[1])) / 60000 + 1);
                throw new IllegalArgumentException(
                        "Too many failed sign-in attempts. Please try again in "
                                + minutes + " minute" + (minutes == 1 ? "" : "s")
                                + " or reset your password.");
            }
        }

        User user = userRepository
                .findByEmail(request.getEmail().trim())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            loginFailures.merge(key, new long[]{1, now}, (old, fresh) -> {
                if (now - old[1] > LOGIN_WINDOW_MS) return fresh;
                old[0]++;
                return old;
            });
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        loginFailures.remove(key);

        if (user.isSuspended()) {
            throw new IllegalArgumentException(
                    "This account has been suspended. Please contact StayBy support."
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
    // FORGOT PASSWORD - STEP 1: SEND A RESET CODE
    // =========================================================
    //
    // Only emails that belong to a StayBy account get a code. An
    // unknown email is reported back so the traveler can fix a typo.
    // (Registration already tells people when an email is taken, so
    // this does not reveal anything new.)

    @Transactional
    public void requestPasswordReset(String email) {

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No StayBy account was found with this email address."));

        // Ignore repeated requests within the cooldown (anti-spam).
        if (user.getPasswordResetExpiresAt() != null) {

            LocalDateTime issuedAt = user.getPasswordResetExpiresAt()
                    .minusMinutes(RESET_CODE_EXPIRATION_MINUTES);

            if (issuedAt.plusSeconds(RESET_COOLDOWN_SECONDS)
                    .isAfter(LocalDateTime.now())) {

                throw new IllegalArgumentException(
                        "A code was just sent. Please wait a minute before asking for another.");
            }
        }

        String code = generateVerificationCode();

        user.setPasswordResetCodeHash(passwordEncoder.encode(code));

        user.setPasswordResetExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(RESET_CODE_EXPIRATION_MINUTES));

        user.setPasswordResetAttempts(0);

        userRepository.save(user);

        try {
            emailService.sendPasswordResetCode(
                    user.getEmail(),
                    user.getName(),
                    code);
        } catch (Exception e) {
            log.warn("Could not send password reset email: {}",
                    e.getMessage());

            // Roll back the saved code and tell the caller.
            throw new IllegalStateException(
                    "We could not send the email right now. Please try again shortly.");
        }
    }

    // =========================================================
    // FORGOT PASSWORD - STEP 2: SET A NEW PASSWORD
    // =========================================================
    //
    // noRollbackFor: a wrong code throws an exception, but the
    // counted attempt must still be saved.

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void resetPassword(
            String email,
            String code,
            String newPassword) {

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired reset code"));

        if (user.getPasswordResetCodeHash() == null
                || user.getPasswordResetExpiresAt() == null) {

            throw new IllegalArgumentException(
                    "Invalid or expired reset code");
        }

        if (LocalDateTime.now().isAfter(
                user.getPasswordResetExpiresAt())) {

            clearPasswordReset(user);
            userRepository.save(user);

            throw new IllegalArgumentException(
                    "This reset code has expired. Please request a new one.");
        }

        int attempts = user.getPasswordResetAttempts() == null
                ? 0
                : user.getPasswordResetAttempts();

        if (attempts >= RESET_MAX_ATTEMPTS) {

            clearPasswordReset(user);
            userRepository.save(user);

            throw new IllegalArgumentException(
                    "Too many wrong attempts. Please request a new code.");
        }

        if (!passwordEncoder.matches(
                code,
                user.getPasswordResetCodeHash())) {

            user.setPasswordResetAttempts(attempts + 1);
            userRepository.save(user);

            throw new IllegalArgumentException("Invalid reset code");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        // Receiving the code proves the person owns this email.
        user.setEmailVerified(true);

        clearPasswordReset(user);

        userRepository.save(user);
    }

    private void clearPasswordReset(User user) {
        user.setPasswordResetCodeHash(null);
        user.setPasswordResetExpiresAt(null);
        user.setPasswordResetAttempts(null);
    }

    // =========================================================
    // GENERATE 6-DIGIT CODE
    // =========================================================

    private String generateVerificationCode() {

        int code = secureRandom.nextInt(1_000_000);

        return String.format("%06d", code);
    }
}