package com.stayby.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.stayby.backend.dto.LandmarkResponse;
import com.stayby.backend.service.LandmarkService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LandmarkController {

    private final LandmarkService landmarkService;

    public LandmarkController(LandmarkService landmarkService) {
        this.landmarkService = landmarkService;
    }

    // Public: places near a property
    @GetMapping("/api/properties/{propertyId}/landmarks")
    public ResponseEntity<List<LandmarkResponse>> getLandmarks(
            @PathVariable Long propertyId) {

        return ResponseEntity.ok(landmarkService.getLandmarks(propertyId));
    }

    // Public: search-box suggestions
    @GetMapping("/api/landmarks/suggest")
    public ResponseEntity<List<String>> suggest(
            @RequestParam(required = false) String q) {

        return ResponseEntity.ok(landmarkService.suggest(q));
    }

    // Owner/admin: look the places up again
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @PostMapping("/api/properties/{propertyId}/landmarks/refresh")
    public ResponseEntity<?> refresh(
            @PathVariable Long propertyId,
            Authentication authentication) {

        try {
            return ResponseEntity.ok(
                    landmarkService.refreshForOwner(
                            propertyId,
                            Long.valueOf(authentication.getName()),
                            isAdmin(authentication)));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(e.getMessage());
        }
    }

    // Owner/admin: remove a place that is not useful
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @DeleteMapping("/api/properties/{propertyId}/landmarks/{landmarkId}")
    public ResponseEntity<?> delete(
            @PathVariable Long propertyId,
            @PathVariable Long landmarkId,
            Authentication authentication) {

        try {
            landmarkService.deleteLandmark(
                    propertyId,
                    landmarkId,
                    Long.valueOf(authentication.getName()),
                    isAdmin(authentication));

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}