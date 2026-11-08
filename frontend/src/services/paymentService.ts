import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  transferReference?: string | null;
  rejectionReason?: string | null;
  receiptSubmittedAt?: string | null;
}

export interface PayHereCheckoutResponse {
  checkoutUrl: string;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
}

function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before making a payment.");
  }

  return token;
}

export async function getBankDetails(
  bookingId: number
): Promise<BankDetails> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/payments/booking/${bookingId}/bank-details`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load bank details.");
  }

  return response.json();
}

export async function uploadBankTransferReceipt(
  bookingId: number,
  file: File,
  transferReference: string
): Promise<PaymentResponse> {
  const token = getToken();

  const formData = new FormData();

  formData.append("file", file);
  formData.append("transferReference", transferReference);

  const response = await fetch(
    `${API_BASE_URL}/api/payments/booking/${bookingId}/bank-transfer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to submit bank transfer receipt.");
  }

  return response.json();
}

export async function getPaymentForBooking(
  bookingId: number
): Promise<PaymentResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/payments/booking/${bookingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load payment information.");
  }

  return response.json();
}

export async function createPayHereCheckout(
  bookingId: number
): Promise<PayHereCheckoutResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/payments/payhere/create/${bookingId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Unable to start PayHere payment.");
  }

  return response.json();
}

export interface OwnerPendingPayment {
  paymentId: number;
  bookingId: number;
  propertyName: string;
  roomName: string;
  travelerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transferReference?: string | null;
  receiptUrl?: string | null;
  receiptSubmittedAt?: string | null;
  checkIn: string;
  checkOut: string;
}

export interface OwnerPaymentActionResponse {
  message: string;
  paymentId: number;
  bookingId: number;
  paymentStatus?: string;
  bookingStatus?: string;
  status?: string;
  rejectionReason?: string;
}

export async function getOwnerPendingPayments(): Promise<
  OwnerPendingPayment[]
> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/owner/payment/pending`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load pending payments.");
  }

  return response.json();
}

export async function approveOwnerPayment(
  paymentId: number
): Promise<OwnerPaymentActionResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/owner/payment/${paymentId}/approve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to approve payment.");
  }

  return response.json();
}

export async function rejectOwnerPayment(
  paymentId: number,
  reason: string
): Promise<OwnerPaymentActionResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/owner/payment/${paymentId}/reject`,
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
    throw await apiError(response, "Failed to reject payment.");
  }

  return response.json();
}