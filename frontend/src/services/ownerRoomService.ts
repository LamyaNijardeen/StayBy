import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface RoomResponse {
  id: number;
  propertyId: number;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  available: boolean;
}

export interface CreateRoomRequest {
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  available: boolean;
}

export interface RoomImageResponse {
  id: number;
  imageUrl: string;
}

/*
 * Get all rooms belonging to a property.
 */
export async function getPropertyRooms(
  propertyId: number
): Promise<RoomResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before viewing rooms.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load rooms.");
  }

  return response.json();
}

/*
 * Create a new room.
 */
export async function createRoom(
  propertyId: number,
  room: CreateRoomRequest
): Promise<RoomResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before creating a room.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to create room.");
  }

  return response.json();
}

/*
 * Update an existing room.
 */
export async function updateRoom(
  propertyId: number,
  roomId: number,
  room: CreateRoomRequest
): Promise<RoomResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before updating a room.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms/${roomId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(room),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to update room.");
  }

  return response.json();
}

/*
 * Delete a room.
 */
export async function deleteRoom(
  propertyId: number,
  roomId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before deleting a room.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms/${roomId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to delete room.");
  }
}

/*
 * Get images belonging to a room.
 */
export async function getRoomImages(
  roomId: number
): Promise<RoomImageResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before viewing room images."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/images`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to load room images.");
  }

  return response.json();
}

/*
 * Upload an image to a room.
 */
export async function uploadRoomImage(
  roomId: number,
  file: File
): Promise<RoomImageResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before uploading room images."
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to upload room image.");
  }

  return response.json();
}

/*
 * Delete a room image.
 */
export async function deleteRoomImage(
  roomId: number,
  imageId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before deleting room images."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to delete room image.");
  }
}