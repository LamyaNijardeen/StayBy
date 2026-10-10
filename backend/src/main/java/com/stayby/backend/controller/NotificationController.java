package com.stayby.backend.controller;

import com.stayby.backend.dto.NotificationResponse;
import com.stayby.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<NotificationResponse>>
    getMyNotifications(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        return ResponseEntity.ok(
                notificationService.getMyNotifications(userId)
        );
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {

        try {

            Long userId = Long.valueOf(
                    authentication.getName()
            );

            notificationService.markAsRead(
                    id,
                    userId
            );

            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(
                authentication.getName()
        );

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok().build();
    }
}