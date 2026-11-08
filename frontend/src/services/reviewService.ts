import { apiError } from "./apiError";
export interface ReviewResponse {
  id: number;
  propertyId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

import { API_BASE_URL } from "../config";

// =========================================================
// CREATE REVIEW
// =========================================================

export async function createReview(
  bookingId: number,
  propertyId: number,
  rating: number,
  comment?: string
): Promise<ReviewResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before submitting a review.");
  }

  const params = new URLSearchParams({
    propertyId: propertyId.toString(),
    rating: rating.toString(),
  });

  if (comment && comment.trim()) {
    params.append("comment", comment.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/reviews/booking/${bookingId}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to submit review.");
  }

  return response.json();
}

// =========================================================
// GET REVIEWS FOR PROPERTY
// =========================================================

export async function getPropertyReviews(
  propertyId: number
): Promise<ReviewResponse[]> {
  /*
   * Reviews are public, so no token is sent. (A stale token on a
   * public endpoint can make the server answer 401.)
   */
  const response = await fetch(
    `${API_BASE_URL}/api/reviews/property/${propertyId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch property reviews.");
  }

  return response.json();
}
// =========================================================
// GET REVIEW FOR BOOKING
// =========================================================

export async function getReviewForBooking(
  bookingId: number
): Promise<ReviewResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view your review.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/reviews/booking/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Review not found.");
  }

  return response.json();
}