package com.stayby.backend.service;

import com.stayby.backend.dto.NotificationResponse;
import com.stayby.backend.entity.Notification;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    public Notification createNotification(
            User user,
            String type,
            String title,
            String message,
            Long relatedId
    ) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedId(relatedId);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            Long userId
    ) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @Transactional(readOnly = true)
    public long getUnreadCount(
            Long userId
    ) {

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Transactional
    public void markAsRead(
            Long notificationId,
            Long userId
    ) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You are not authorized to update this notification"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public void markAllAsRead(
            Long userId
    ) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {

            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }

        notificationRepository.saveAll(notifications);
    }
}