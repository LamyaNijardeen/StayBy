import { apiError } from "./apiError";
import type { LandmarkResponse } from "./landmarkService";

export interface RoomResponse {
  id: number;
  propertyId: number;
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

export interface PropertyImageResponse {
  id: number;
  imageUrl: string;
}

export interface PropertySearchResponse {
  id: number;
  name: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;

owner: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
};
  availableRooms: RoomResponse[];

  suitablePurposes: string[];
  amenities: string[];

  /* Important places near the stay (hospital, university...) */
  nearbyLandmarks?: LandmarkResponse[];

  /* Set only when the traveler searched by landmark */
  matchedLandmark?: LandmarkResponse | null;

  /* true when the stay satisfies everything the traveler typed */
  relevant?: boolean;
}

export interface PropertySearchParams {
  city?: string;
  propertyType?: string;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  purpose?: string;
  landmark?: string;
}

import { API_BASE_URL } from "../config";

/**
 * Get the JWT token stored after login.
 *
 * Used only for endpoints that actually require
 * authentication.
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

/* =========================================================
   PROPERTY SEARCH
========================================================= */

/**
 * Search properties by city, type, dates, guests and purpose.
 *
 * This endpoint is publicly accessible.
 * Do NOT send the JWT here because an expired/invalid
 * token can cause Spring Security to return 401 even
 * though the endpoint itself is public.
 */
export async function searchAvailableProperties(
  params: PropertySearchParams
): Promise<PropertySearchResponse[]> {
  const searchParams = new URLSearchParams();

  if (params.city) {
    searchParams.append("city", params.city);
  }

  if (params.propertyType) {
    searchParams.append(
      "propertyType",
      params.propertyType
    );
  }

  if (params.checkIn && params.checkOut) {
    searchParams.append("checkIn", params.checkIn);
    searchParams.append("checkOut", params.checkOut);
  }
  searchParams.append(
    "guests",
    params.guests.toString()
  );

  if (params.purpose) {
    searchParams.append("purpose", params.purpose);
  }

  if (params.landmark) {
    searchParams.append("landmark", params.landmark);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/search?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to search properties");
  }

  return response.json();
}

/* =========================================================
   ALL PROPERTIES
========================================================= */

/**
 * Get properties for the public Home page sections.
 *
 * Backend:
 * GET /api/properties
 * GET /api/properties?verified=true
 *
 * This endpoint is public.
 *
 * IMPORTANT:
 * No Authorization header is sent here.
 */
export async function getAllProperties(
  verified?: boolean
): Promise<PropertySearchResponse[]> {
  const searchParams = new URLSearchParams();

  if (verified !== undefined) {
    searchParams.append(
      "verified",
      verified.toString()
    );
  }

  const queryString =
    searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/api/properties${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch properties");
  }

  return response.json();
}

/* =========================================================
   SINGLE PROPERTY
========================================================= */

/**
 * Get a single property.
 *
 * Authentication is still included here because the
 * backend uses the authenticated user to determine
 * whether an owner/admin may view an unverified property.
 *
 * Verified properties remain publicly accessible.
 */
export async function getPropertyById(
  propertyId: number
): Promise<PropertySearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch property");
  }

  return response.json();
}

/* =========================================================
   ROOM AVAILABILITY
========================================================= */

/**
 * Get all available rooms for a property.
 *
 * Backend:
 * GET /api/properties/{propertyId}/rooms/available
 *
 * This endpoint is public.
 */
export async function getAvailableRoomsByProperty(
  propertyId: number
): Promise<RoomResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms/available`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch available rooms");
  }

  return response.json();
}

/**
 * Get rooms that are available for specific dates
 * and number of guests.
 *
 * Backend:
 * GET /api/properties/{propertyId}/rooms/available-dates
 *
 * This endpoint is public.
 */
export async function getAvailableRoomsByDates(
  propertyId: number,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<RoomResponse[]> {
  const searchParams = new URLSearchParams();

  searchParams.append("checkIn", checkIn);
  searchParams.append("checkOut", checkOut);
  searchParams.append(
    "guests",
    guests.toString()
  );

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/rooms/available-dates?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to check room availability");
  }

  return response.json();
}

/* =========================================================
   ROOM IMAGES
========================================================= */

/**
 * Get images belonging to a room.
 *
 * Backend:
 * GET /api/rooms/{roomId}/images
 *
 * This endpoint is public.
 */
export async function getRoomImages(
  roomId: number
): Promise<RoomImageResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${roomId}/images`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch room images");
  }

  return response.json();
}

/* =========================================================
   PROPERTY IMAGES
========================================================= */

/**
 * Get images belonging to a property.
 *
 * Backend:
 * GET /api/properties/{propertyId}/images
 *
 * This endpoint is public.
 */
export async function getPropertyImages(
  propertyId: number
): Promise<PropertyImageResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/images`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch property images");
  }

  return response.json();
}

/* =========================================================
   IMAGE URL
========================================================= */

/**
 * Convert a backend image path such as:
 *
 * /uploads/room-images/example.jpg
 *
 * into:
 *
 * http://localhost:8080/uploads/room-images/example.jpg
 */
export function getImageUrl(
  imageUrl: string
): string {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

/* =========================================================
   FAVORITES
========================================================= */

/**
 * Add a property to the user's favorites.
 *
 * Backend:
 * POST /api/favorites/{propertyId}?userId={userId}
 *
 * Authentication required.
 */
export async function addFavorite(
  propertyId: number,
  userId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/favorites/${propertyId}?userId=${userId}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to add property to favorites");
  }
}

/**
 * Check whether a property is in the user's favorites.
 *
 * Backend:
 * GET /api/favorites/{propertyId}/check?userId={userId}
 *
 * Authentication required.
 */
export async function checkFavorite(
  propertyId: number,
  userId: number
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/api/favorites/${propertyId}/check?userId=${userId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to check favorite status");
  }

  return response.json();
}

/**
 * Remove a property from the user's favorites.
 *
 * Backend:
 * DELETE /api/favorites/{propertyId}?userId={userId}
 *
 * Authentication required.
 */
export async function removeFavorite(
  propertyId: number,
  userId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/favorites/${propertyId}?userId=${userId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to remove property from favorites");
  }
}

/**
 * Get all properties saved by the logged-in user.
 *
 * Backend:
 * GET /api/favorites?userId={userId}
 *
 * Authentication required.
 */
export interface FavoritePropertyResponse {
  id: number;
  name: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
}

export interface FavoriteResponse {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  property: FavoritePropertyResponse;
  createdAt: string;
}

export async function getFavorites(
  userId: number
): Promise<FavoriteResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/favorites?userId=${userId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to fetch favorites");
  }

  return response.json();
}

