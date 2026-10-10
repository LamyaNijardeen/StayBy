export interface ReviewResponse {
  id: number;
  propertyId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const API_BASE_URL = "http://localhost:8080";

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
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to submit review."
    );
  }

  return response.json();
}

// =========================================================
// GET REVIEWS FOR PROPERTY
// =========================================================

export async function getPropertyReviews(
  propertyId: number
): Promise<ReviewResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view property reviews.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/reviews/property/${propertyId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to fetch property reviews."
    );
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
    const errorText = await response.text();

    throw new Error(
      errorText || "Review not found."
    );
  }

  return response.json();
}