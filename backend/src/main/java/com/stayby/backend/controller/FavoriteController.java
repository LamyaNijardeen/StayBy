package com.stayby.backend.controller;

import com.stayby.backend.entity.Favorite;
import com.stayby.backend.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<Favorite> addFavorite(
            @RequestParam Long userId,
            @PathVariable Long propertyId
    ) {
        return ResponseEntity.ok(
                favoriteService.addFavorite(userId, propertyId)
        );
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> removeFavorite(
            @RequestParam Long userId,
            @PathVariable Long propertyId
    ) {
        favoriteService.removeFavorite(userId, propertyId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Favorite>> getUserFavorites(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(
                favoriteService.getUserFavorites(userId)
        );
    }

    @GetMapping("/{propertyId}/check")
    public ResponseEntity<Boolean> isFavorite(
            @RequestParam Long userId,
            @PathVariable Long propertyId
    ) {
        return ResponseEntity.ok(
                favoriteService.isFavorite(userId, propertyId)
        );
    }
}