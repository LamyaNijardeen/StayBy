package com.stayby.backend.dto;

import com.stayby.backend.entity.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(
            Long id,
            String type,
            String title,
            String message,
            Long relatedId,
            boolean read,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationResponse fromEntity(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public Long getRelatedId() {
        return relatedId;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}