const API_BASE_URL = "http://localhost:8080";

export interface OwnerPropertyResponse {
  id: number;
  name: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;

  suitablePurposes: string[];

  owner: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreatePropertyRequest {
  name: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;

  suitablePurposes: string[];
}

/*
 * Response returned for a property image.
 */
export interface PropertyImageResponse {
  id: number;
  imageUrl: string;
}

/*
 * Get properties belonging to the currently logged-in owner.
 */
export async function getMyProperties(): Promise<
  OwnerPropertyResponse[]
> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before viewing your properties."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties`,
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
      errorText || "Failed to load your properties."
    );
  }

  const properties: OwnerPropertyResponse[] =
    await response.json();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return properties.filter(
    (property) => property.owner.id === user.id
  );
}

/*
 * Create a new property.
 */
export async function createProperty(
  property: CreatePropertyRequest
): Promise<OwnerPropertyResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before creating a property."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(property),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to create property."
    );
  }

  return response.json();
}

/*
 * Upload one image to a property.
 *
 * Backend endpoint:
 * POST /api/properties/{propertyId}/images
 *
 * Backend expects:
 * multipart/form-data
 * field name = "file"
 */
export async function uploadPropertyImage(
  propertyId: number,
  file: File
): Promise<PropertyImageResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before uploading property images."
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/images`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to upload property image."
    );
  }

  return response.json();
}

/*
 * Get all images belonging to a property.
 *
 * Backend endpoint:
 * GET /api/properties/{propertyId}/images
 */
export async function getPropertyImages(
  propertyId: number
): Promise<PropertyImageResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before viewing property images."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}/images`,
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
      errorText || "Failed to load property images."
    );
  }

  return response.json();
}

/*
 * Update an existing property.
 */
export async function updateProperty(
  propertyId: number,
  property: CreatePropertyRequest
): Promise<OwnerPropertyResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before updating a property."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(property),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to update property."
    );
  }

  return response.json();
}

/*
 * Delete an existing property.
 */
export async function deleteProperty(
  propertyId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Please log in before deleting a property."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/properties/${propertyId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to delete property."
    );
  }
}
