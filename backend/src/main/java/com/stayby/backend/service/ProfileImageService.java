package com.stayby.backend.service;

import com.stayby.backend.entity.User;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Profile pictures for travelers and owners.
 *
 * Only JPEG, PNG and WebP are accepted. The type is decided from the
 * file's first bytes, not from its name or the browser's claim, and the
 * stored file name is generated here, so nothing the user types ends up
 * in a file path.
 */
@Service
public class ProfileImageService {

    private static final long MAX_BYTES = 2L * 1024 * 1024;

    private final Path uploadDirectory =
            Paths.get("uploads/profile-images");

    private final UserRepository userRepository;

    public ProfileImageService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User upload(Long userId, MultipartFile file) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a picture");
        }

        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException(
                    "The picture must be smaller than 2 MB");
        }

        byte[] bytes = file.getBytes();

        String extension = detectExtension(bytes);

        if (extension == null) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG or WebP pictures are allowed");
        }

        Files.createDirectories(uploadDirectory);

        String filename = userId + "-" + UUID.randomUUID() + extension;

        Files.write(uploadDirectory.resolve(filename), bytes);

        deleteStoredFile(user.getProfileImageUrl());

        user.setProfileImageUrl("/uploads/profile-images/" + filename);

        return userRepository.save(user);
    }

    public User remove(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        deleteStoredFile(user.getProfileImageUrl());

        user.setProfileImageUrl(null);

        return userRepository.save(user);
    }

    /** Looks at the first bytes of the file. Returns null if not an allowed image. */
    private String detectExtension(byte[] b) {

        if (b.length >= 3
                && (b[0] & 0xFF) == 0xFF
                && (b[1] & 0xFF) == 0xD8
                && (b[2] & 0xFF) == 0xFF) {
            return ".jpg";
        }

        if (b.length >= 8
                && (b[0] & 0xFF) == 0x89
                && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return ".png";
        }

        if (b.length >= 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return ".webp";
        }

        return null;
    }

    private void deleteStoredFile(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        try {
            String filename =
                    imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

            Files.deleteIfExists(uploadDirectory.resolve(filename));
        } catch (Exception ignored) {
            // The database record is what matters.
        }
    }
}