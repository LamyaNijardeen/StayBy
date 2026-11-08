import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface RefundResponse {
  id: number;
  bookingId: number;
  paymentId: number;
  amount: number;
  status: string;
  reason: string;
  refundReference?: string | null;
  processedAt?: string | null;
  createdAt: string;

  // BANK_TRANSFER or PAYHERE
  paymentMethod?: string | null;
  travelerName?: string | null;
  travelerEmail?: string | null;
}


function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before managing refunds."
    );
  }

  return token;
}

// =========================================================
// GET OWNER REFUNDS
// =========================================================

export async function getOwnerRefunds(): Promise<
  RefundResponse[]
> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/refunds/owner`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch refunds.");
  }

  return response.json();
}

// =========================================================
// GET TRAVELER REFUND FOR BOOKING
// =========================================================

export async function getTravelerRefund(
  bookingId: number
): Promise<RefundResponse | null> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/refunds/booking/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch refund.");
  }

  return response.json();
}

// =========================================================
// COMPLETE REFUND
// =========================================================

export async function completeRefund(
  refundId: number,
  refundReference: string
): Promise<RefundResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/refunds/${refundId}/complete`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundReference,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to complete refund.");
  }

  return response.json();
}

// =========================================================
// FAIL REFUND
// =========================================================

export async function failRefund(
  refundId: number,
  reason: string
): Promise<RefundResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/refunds/${refundId}/fail`,
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
    throw await apiError(response, "Failed to update refund.");
  }

  return response.json();
}