import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface AdminDashboardStats {
  totalUsers: number;
  totalTravelers: number;
  totalOwners: number;
  totalAdmins: number;

  totalProperties: number;
  verifiedProperties: number;
  pendingProperties: number;

  totalRooms: number;

  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load admin dashboard.");
  }

  return response.json();
}
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
}

export async function setUserSuspended(
  id: number,
  suspended: boolean
): Promise<AdminUser> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${id}/suspended`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suspended }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to update the user.");
  }

  return response.json();
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/users`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load users.");
  }

  return response.json();
}
export interface AdminProperty {
  id: number;
  name: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  createdAt: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string | null;
}

export async function getAdminProperties(): Promise<AdminProperty[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/properties`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load properties.");
  }

  return response.json();
}

export interface AdminBooking {
  id: number;

  travelerId: number;
  travelerName: string;
  travelerEmail: string;

  propertyId: number;
  propertyName: string;

  roomId: number;
  roomName: string;

  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;

  status: string;
  rejectionReason?: string | null;
  createdAt: string;
}

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/bookings`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load bookings.");
  }

  return response.json();
}

// =========================================================
// ADMIN REVIEWS
// =========================================================

export interface AdminReview {
  id: number;
  propertyId: number;
  propertyName: string;
  travelerId: number;
  travelerName: string;
  travelerEmail: string;
  bookingId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reviews`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load reviews.");
  }

  return response.json();
}

export async function deleteAdminReview(
  reviewId: number
): Promise<void> {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in as an administrator.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/reviews/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to delete review.");
  }
}

