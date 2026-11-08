package com.stayby.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.stayby.backend.dto.FavoriteResponse;
import com.stayby.backend.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Favorites always belong to the LOGGED-IN user.
 *
 * The user is taken from the JWT, never from the request.
 * The optional "userId" query parameter is still accepted so that
 * the existing frontend keeps working, but it is IGNORED.
 */
@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("hasRole('TRAVELER')")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<?> addFavorite(
            @PathVariable Long propertyId,
            @RequestParam(required = false) Long userId,
            Authentication authentication
    ) {
        try {
            Long currentUserId = getCurrentUserId(authentication);

            return ResponseEntity.ok(
                    FavoriteResponse.fromEntity(
                            favoriteService.addFavorite(
                                    currentUserId,
                                    propertyId
                            )
                    )
            );

        } catch (NumberFormatException e) {
            return unauthorized();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long propertyId,
            @RequestParam(required = false) Long userId,
            Authentication authentication
    ) {
        try {
            Long currentUserId = getCurrentUserId(authentication);

            favoriteService.removeFavorite(
                    currentUserId,
                    propertyId
            );

            return ResponseEntity.noContent().build();

        } catch (NumberFormatException e) {
            return unauthorized();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserFavorites(
            @RequestParam(required = false) Long userId,
            Authentication authentication
    ) {
        try {
            Long currentUserId = getCurrentUserId(authentication);

            List<FavoriteResponse> favorites =
                    favoriteService.getUserFavorites(currentUserId)
                            .stream()
                            .map(FavoriteResponse::fromEntity)
                            .toList();

            return ResponseEntity.ok(favorites);

        } catch (NumberFormatException e) {
            return unauthorized();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{propertyId}/check")
    public ResponseEntity<?> isFavorite(
            @PathVariable Long propertyId,
            @RequestParam(required = false) Long userId,
            Authentication authentication
    ) {
        try {
            Long currentUserId = getCurrentUserId(authentication);

            return ResponseEntity.ok(
                    favoriteService.isFavorite(
                            currentUserId,
                            propertyId
                    )
            );

        } catch (NumberFormatException e) {
            return unauthorized();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    private Long getCurrentUserId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }

    private ResponseEntity<String> unauthorized() {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid authentication");
    }
}