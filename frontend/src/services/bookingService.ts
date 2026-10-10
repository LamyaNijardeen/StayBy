export interface BookingResponse {
  id: number;
  roomId: number;
  roomName: string;
  propertyId: number;
  propertyName: string;

  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  checkIn: string;
  checkOut: string;
  guests: number;
  purpose?: string | null;
  totalPrice: number;
  status: string;
  rejectionReason?: string | null;
}

const API_BASE_URL = "http://localhost:8080";

export async function createBooking(
  roomId: number,
  checkIn: string,
  checkOut: string,
  guests: number,
  purpose: string
): Promise<BookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before making a booking.");
  }

  const params = new URLSearchParams({
    checkIn,
    checkOut,
    guests: guests.toString(),
    purpose,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/room/${roomId}?${params.toString()}`,
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
      errorText || "Failed to create booking"
    );
  }

  return response.json();
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view your bookings.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/my`,
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
      errorText || "Failed to fetch your bookings"
    );
  }

  return response.json();
}

export async function cancelBooking(
  bookingId: number
): Promise<BookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in before managing your bookings.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to cancel booking."
    );
  }

  return response.json();
}

export async function getBooking(
  bookingId: number
): Promise<BookingResponse> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view booking details.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/bookings/${bookingId}`,
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
      errorText || "Failed to load booking details."
    );
  }

  return response.json();
}