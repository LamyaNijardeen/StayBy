import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  /** Empty string when there is no profile picture. */
  profileImageUrl?: string;
}

function getToken(): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in first.");
  }

  return token;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/users/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load profile.");
  }

  return response.json();
}

export async function updateCurrentUser(
  phone: string
): Promise<CurrentUserResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/users/me`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
      }),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to update profile.");
  }

  return response.json();
}

export async function updateName(
  name: string
): Promise<CurrentUserResponse> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to update name."));
  }

  return response.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to change password."));
  }
}

// =========================================================
// PROFILE PICTURE
// =========================================================

export async function uploadProfilePhoto(
  file: Blob
): Promise<CurrentUserResponse> {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file, "profile.jpg");

  const response = await fetch(
    `${API_BASE_URL}/api/users/me/photo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to upload picture."));
  }

  return response.json();
}

export async function removeProfilePhoto(): Promise<CurrentUserResponse> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/users/me/photo`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to remove picture."));
  }

  return response.json();
}

async function readError(
  response: Response,
  fallback: string
): Promise<string> {
  return (await apiError(response, fallback)).message;
}
