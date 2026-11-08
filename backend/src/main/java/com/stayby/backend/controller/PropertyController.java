package com.stayby.backend.controller;

import com.stayby.backend.dto.PropertyResponse;
import com.stayby.backend.entity.Property;
import com.stayby.backend.service.PropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Boolean verified
    ) {

        List<PropertyResponse> properties =
                propertyService.searchProperties(
                        city,
                        propertyType,
                        verified
                )
                .stream()
                .map(PropertyResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(properties);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAvailableProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) LocalDate checkIn,
            @RequestParam(required = false) LocalDate checkOut,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) String landmark
    ) {

        try {

            return ResponseEntity.ok(
                    propertyService.searchAvailableProperties(
                            city,
                            propertyType,
                            checkIn,
                            checkOut,
                            guests,
                            purpose,
                            landmark
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

@GetMapping("/{id}")
public ResponseEntity<?> getPropertyById(
        @PathVariable Long id,
        Authentication authentication
) {

    try {

        Long authenticatedUserId = null;
        boolean isAdmin = false;

        if (authentication != null
                && authentication.isAuthenticated()) {

            try {
                authenticatedUserId = Long.valueOf(
                        authentication.getName()
                );
            } catch (NumberFormatException ignored) {
                // No numeric user ID available.
            }

            isAdmin = authentication.getAuthorities()
                    .stream()
                    .anyMatch(authority ->
                            authority.getAuthority()
                                    .equals("ROLE_ADMIN")
                    );
        }

        Property property =
                propertyService.getPropertyByIdForViewer(
                        id,
                        authenticatedUserId,
                        isAdmin
                );

        return ResponseEntity.ok(
                PropertyResponse.fromEntity(property)
        );

    } catch (IllegalArgumentException e) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }
}

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ResponseEntity<?> createProperty(
            @RequestBody Property property,
            Authentication authentication
    ) {
        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Property savedProperty =
                    propertyService.createProperty(
                            property,
                            userId
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            PropertyResponse.fromEntity(
                                    savedProperty
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(
            @PathVariable Long id,
            @RequestBody Property property,
            Authentication authentication
    ) {
        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            Property updatedProperty =
                    propertyService.updateProperty(
                            id,
                            property,
                            userId
                    );

            return ResponseEntity.ok(
                    PropertyResponse.fromEntity(
                            updatedProperty
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}/listed")
    public ResponseEntity<?> setListed(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> request,
            Authentication authentication
    ) {
        Boolean listed = request.get("listed");

        if (listed == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Missing 'listed' value.");
        }

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    PropertyResponse.fromEntity(
                            propertyService.setListed(id, userId, listed)
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            propertyService.deleteProperty(
                    id,
                    userId
            );

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyProperty(
            @PathVariable Long id
    ) {
        try {

            Property verifiedProperty =
                    propertyService.verifyProperty(id);

            return ResponseEntity.ok(
                    PropertyResponse.fromEntity(
                            verifiedProperty
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectProperty(
            @PathVariable Long id
    ) {
        try {

            Property rejectedProperty =
                    propertyService.rejectProperty(id);

            return ResponseEntity.ok(
                    PropertyResponse.fromEntity(
                            rejectedProperty
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}