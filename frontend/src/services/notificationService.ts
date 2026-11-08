export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  message: string;
  relatedId: number | null;
  read: boolean;
  createdAt: string;
}

import { API_BASE_URL } from "../config";

// =========================================================
// GET NOTIFICATIONS
// =========================================================

export async function getNotifications(): Promise<
  NotificationResponse[]
> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications.");
  }

  return response.json();
}

// =========================================================
// GET UNREAD COUNT
// =========================================================

export async function getUnreadNotificationCount(): Promise<number> {
  const token = localStorage.getItem("token");

  if (!token) {
    return 0;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch notification count."
    );
  }

  return response.json();
}

// =========================================================
// MARK ONE AS READ
// =========================================================

export async function markNotificationAsRead(
  notificationId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark notification as read."
    );
  }
}

// =========================================================
// MARK ALL AS READ
// =========================================================

export async function markAllNotificationsAsRead(): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/read-all`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark notifications as read."
    );
  }
}