import { apiError } from "./apiError";
import { API_BASE_URL } from "../config";

export interface LandmarkResponse {
  id: number;
  name: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number;
}

/* =========================================================
   HELPERS
========================================================= */

/** 0.4 -> "400 m", 2.04 -> "2.0 km" */
export function formatLandmarkDistance(km: number): string {
  if (km < 0.1) {
    return "Under 100 m";
  }

  if (km < 1) {
    return `${Math.round(km * 10) * 100} m`;
  }

  return `${km.toFixed(1)} km`;
}

/**
 * Same rule the backend uses: every word the traveler typed must
 * appear in the landmark's name or category.
 */
export function landmarkMatches(
  query: string,
  landmark: LandmarkResponse
): boolean {
  if (!query.trim()) {
    return false;
  }

  const haystack =
    `${landmark.name} ${landmark.category}`.toLowerCase();

  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* =========================================================
   PUBLIC
========================================================= */

/** Places near a property (public). */
export async function getPropertyLandmarks(
  propertyId: number
): Promise<LandmarkResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/landmarks`
  );

  if (!response.ok) {
    throw new Error("Failed to load nearby places.");
  }

  return response.json();
}

/** Search-box suggestions for landmark names (public). */
export async function getLandmarkSuggestions(
  query: string
): Promise<string[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/api/landmarks/suggest?q=${encodeURIComponent(
      query.trim()
    )}`
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

/* =========================================================
   OWNER
========================================================= */

/** Look the nearby places up again from the saved location. */
export async function refreshPropertyLandmarks(
  propertyId: number
): Promise<LandmarkResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/landmarks/refresh`,
    {
      method: "POST",
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to refresh nearby places.");
  }

  return response.json();
}

/** Remove one place from a property. */
export async function deletePropertyLandmark(
  propertyId: number,
  landmarkId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/landmarks/${landmarkId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw await apiError(response, "Failed to remove this place.");
  }
}
