import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface ComplaintResponse {
  id: number;
  bookingId: number;
  travelerId: number;
  travelerName: string;
  travelerEmail: string;
  subject: string;
  description: string;
  adminResponse: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in first.");
  }

  return token;
}

export async function createComplaint(
  bookingId: number,
  subject: string,
  description: string
): Promise<ComplaintResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/complaints`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        subject,
        description,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to submit complaint.");
  }

  return response.json();
}

export async function getMyComplaints(): Promise<
  ComplaintResponse[]
> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/my`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load complaints.");
  }

  return response.json();
}

export async function getAllComplaints(): Promise<
  ComplaintResponse[]
> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/admin`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load complaints.");
  }

  return response.json();
}

export async function updateComplaintStatus(
  complaintId: number,
  status: string
): Promise<ComplaintResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/admin/${complaintId}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to update complaint status.");
  }

  return response.json();
}
export async function updateComplaintResponse(
  complaintId: number,
  adminResponse: string
): Promise<ComplaintResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/admin/${complaintId}/response`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminResponse,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to save admin response.");
  }

  return response.json();
}