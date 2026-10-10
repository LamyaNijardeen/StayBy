const API_BASE_URL = "http://localhost:8080";

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
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
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to load profile."
    );
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
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to update profile."
    );
  }

  return response.json();
}