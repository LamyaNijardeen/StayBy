import { apiError } from "./apiError";
export interface OwnerBookingResponse {
  id: number;
  roomId: number;
  roomName: string;
  propertyId: number;
  propertyName: string;

  travelerName: string;
  travelerEmail: string;

  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  rejectionReason?: string | null;
}

import { API_BASE_URL } from "../config";

export async function getOwnerBookings(): Promise<OwnerBookingResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before viewing owner bookings.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/owner`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load owner bookings.");
  }

  return response.json();
}

export async function confirmBooking(
  bookingId: number
): Promise<OwnerBookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before confirming a booking.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/confirm`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to confirm booking.");
  }

  return response.json();
}

export async function rejectBooking(
  bookingId: number,
  reason: string
): Promise<OwnerBookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before rejecting a booking.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/reject`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to reject booking.");
  }

  return response.json();
}
export async function getOwnerBooking(
  bookingId: number
): Promise<OwnerBookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view booking details.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/owner/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load booking details.");
  }

  return response.json();
}