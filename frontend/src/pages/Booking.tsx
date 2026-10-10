import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  Users,
} from "lucide-react";
import TravelerNavbar from "../components/TravelerNavbar";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createBooking } from "../services/bookingService";

interface BookingLocationState {
  propertyId: number;
  propertyName: string;
  propertyType: string;
  city: string;
  roomId: number;
  roomName: string;
  roomImage: string;
  pricePerNight: number;
  capacity: number;
  checkIn: string;
  checkOut: string;
  guests: number;
}
const PURPOSE_OPTIONS = [
  "Medical Visit",
  "Education",
  "Work / Business",
  "Tour / Vacation",
  "Picnic / Day Trip",
  "Family Gathering",
  "Wedding / Event",
  "Visiting Family / Friends",
  "Religious / Cultural Visit",
  "Sports / Competition",
  "Festival / Celebration",
  "Other",
];

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData =
    location.state as BookingLocationState | null;

  const [checkIn, setCheckIn] = useState(
    bookingData?.checkIn || ""
  );

  const [checkOut, setCheckOut] = useState(
    bookingData?.checkOut || ""
  );

  const [guests, setGuests] = useState(
    bookingData?.guests || 1
  );
  const [purpose, setPurpose] = useState("");
const [customPurpose, setCustomPurpose] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /*
   * If the user opens /booking directly without
   * coming from PropertyDetails, there is no booking data.
   */
  if (!bookingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">
            Booking information not found
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Please select a room before continuing.
          </p>

          <button
            type="button"
            onClick={() => navigate("/search")}
            className="mt-6 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
          >
            Back to search
          </button>
        </div>
      </div>
    );
  }

  const {
    propertyName,
    propertyType,
    city,
    roomId,
    roomName,
    pricePerNight,
    capacity,
    roomImage,
  } = bookingData;

  /*
   * Calculate the number of nights.
   *
   * Example:
   * Check-in  = 2026-08-28
   * Check-out = 2026-08-30
   * Nights    = 2
   *
   * Using YYYY-MM-DD strings with UTC prevents
   * timezone/DST issues during the calculation.
   */
  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00Z`);
    const end = new Date(`${checkOut}T00:00:00Z`);

    const difference =
      end.getTime() - start.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.round(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  const nights = calculateNights();

  /*
   * Room price for the complete stay.
   */
  const roomTotal =
    nights > 0
      ? pricePerNight * nights
      : 0;

  /*
   * Service fee = 10% of room total.
   */
  const serviceFee =
    roomTotal > 0
      ? Math.round(roomTotal * 0.1)
      : 0;

  /*
   * Final booking total.
   */
  const total = roomTotal + serviceFee;

  /*
   * Today's date in YYYY-MM-DD format.
   */
  const today = new Date()
    .toISOString()
    .split("T")[0];

  /*
   * Check-in date changed.
   *
   * If the existing checkout date is no longer valid,
   * clear it so the user can select a new checkout date.
   */
  const handleCheckInChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDate = event.target.value;

    setCheckIn(selectedDate);

    if (checkOut && checkOut <= selectedDate) {
      setCheckOut("");
    }

    setError("");
  };

  /*
   * Check-out date changed.
   */
  const handleCheckOutChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDate = event.target.value;

    setCheckOut(selectedDate);
    setError("");
  };

  /*
   * Confirm booking.
   */
  const handleConfirmBooking = async () => {
    setError("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select your check-in and check-out dates."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (nights <= 0) {
      setError(
        "Please select a valid stay period."
      );
      return;
    }

    if (guests < 1) {
      setError(
        "Please select at least one guest."
      );
      return;
    }

    if (guests > capacity) {
      setError(
        `This room can accommodate a maximum of ${capacity} guests.`
      );
      return;
    }
    if (!purpose) {
  setError("Please select the reason for your stay.");
  return;
}

if (purpose === "Other" && !customPurpose.trim()) {
  setError("Please tell us the reason for your stay.");
  return;
}

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

  await createBooking(
  roomId,
  checkIn,
  checkOut,
  guests,
  purpose === "Other" ? customPurpose.trim() : purpose
);

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Success screen
   */
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
<TravelerNavbar />

        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2
                size={34}
                className="text-green-600"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--color-navy)]">
              Booking request submitted
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Your booking for{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {propertyName}
              </span>{" "}
              has been submitted successfully.
            </p>

            <div className="mt-6 rounded-xl bg-[var(--color-background)] p-5 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Room
                </span>

                <span className="font-medium text-[var(--color-text)]">
                  {roomName}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Dates
                </span>

                <span className="font-medium text-[var(--color-text)]">
                  {checkIn} → {checkOut}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Nights
                </span>

                <span className="font-medium text-[var(--color-text)]">
                  {nights}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Guests
                </span>

                <span className="font-medium text-[var(--color-text)]">
                  {guests}
                </span>
              </div>

              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    Room total
                  </span>

                  <span>
                    LKR {roomTotal.toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    Service fee
                  </span>

                  <span>
                    LKR {serviceFee.toLocaleString()}
                  </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-[var(--color-border)] pt-4 font-semibold text-[var(--color-navy)]">
                  <span>Total</span>

                  <span>
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="mt-6 w-full rounded-xl bg-[var(--color-coral)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
            >
              Back to search
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <TravelerNavbar />

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        {/* Heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Almost there
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Confirm your stay
          </h1>

          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Review your booking details before continuing.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Stay summary */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <div className="flex gap-5">
               <img
  src={
    roomImage ||
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=500&q=80"
  }
  alt={roomName}
  className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-40"
/>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {propertyType}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--color-navy)]">
                    {propertyName}
                  </h2>

                  <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                    {roomName}
                  </p>

                  <p className="mt-2 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                    <MapPin size={14} />
                    {city}, Sri Lanka
                  </p>
                </div>
              </div>
            </section>

            {/* Your trip */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Your trip
              </h2>

              <div className="mt-6 divide-y divide-[var(--color-border)]">
                {/* Dates */}
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[var(--color-coral-light)] p-2.5">
                        <CalendarDays
                          size={19}
                          className="text-[var(--color-coral)]"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          DATES
                        </p>

                        <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                          {checkIn && checkOut
                            ? `${checkIn} → ${checkOut}`
                            : "Select your dates"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="check-in"
                        className="text-xs font-semibold text-[var(--color-text-secondary)]"
                      >
                        CHECK-IN
                      </label>

                      <input
                        id="check-in"
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={handleCheckInChange}
                        className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="check-out"
                        className="text-xs font-semibold text-[var(--color-text-secondary)]"
                      >
                        CHECK-OUT
                      </label>

                      <input
                        id="check-out"
                        type="date"
                        value={checkOut}
                        min={
                          checkIn
                            ? checkIn
                            : today
                        }
                        onChange={handleCheckOutChange}
                        disabled={!checkIn}
                        className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {nights > 0 && (
                    <p className="mt-3 text-xs font-medium text-[var(--color-coral)]">
                      {nights}{" "}
                      {nights === 1
                        ? "night"
                        : "nights"}{" "}
                      stay
                    </p>
                  )}
                </div>

                {/* Stay purpose */}
<section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-[var(--color-navy)]">
    What's the reason for your stay?
  </h2>

  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
    This helps StayBy understand what you're looking for.
  </p>

  <div className="mt-5">
    <label
      htmlFor="purpose"
      className="text-sm font-semibold text-[var(--color-text)]"
    >
      Reason for stay
    </label>

    <select
      id="purpose"
      value={purpose}
      onChange={(e) => {
        setPurpose(e.target.value);
        setCustomPurpose("");
        setError("");
      }}
      className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
    >
      <option value="">Select a reason</option>

      {PURPOSE_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>

  {purpose === "Other" && (
    <div className="mt-4">
      <label
        htmlFor="custom-purpose"
        className="text-sm font-semibold text-[var(--color-text)]"
      >
        Tell us more
      </label>

      <textarea
        id="custom-purpose"
        value={customPurpose}
        onChange={(e) => {
          setCustomPurpose(e.target.value);
          setError("");
        }}
        placeholder="Tell us briefly why you're staying..."
        rows={3}
        maxLength={150}
        className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
      />

      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        {customPurpose.length}/150 characters
      </p>
    </div>
  )}
</section>

                {/* Guests */}
                <div className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[var(--color-coral-light)] p-2.5">
                      <Users
                        size={19}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        GUESTS
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                        {guests}{" "}
                        {guests === 1
                          ? "guest"
                          : "guests"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="guests"
                      className="text-xs font-semibold text-[var(--color-text-secondary)]"
                    >
                      NUMBER OF GUESTS
                    </label>

                    <select
                      id="guests"
                      value={guests}
                      onChange={(e) =>
                        setGuests(
                          Number(e.target.value)
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                    >
                      {Array.from(
                        { length: capacity },
                        (_, index) => index + 1
                      ).map((number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}{" "}
                          {number === 1
                            ? "guest"
                            : "guests"}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      Maximum capacity:{" "}
                      {capacity} guests
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Guest details */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Guest details
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="booking-name"
                    className="text-sm font-semibold text-[var(--color-text)]"
                  >
                    Full name
                  </label>

                  <input
                    id="booking-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="text-sm font-semibold text-[var(--color-text)]"
                  >
                    Email address
                  </label>

                  <input
                    id="booking-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg shadow-black/5">
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Price details
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                {/* Room price */}
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--color-text-secondary)]">
                    LKR{" "}
                    {pricePerNight.toLocaleString()}{" "}
                    × {nights}{" "}
                    {nights === 1
                      ? "night"
                      : "nights"}
                  </span>

                  <span className="shrink-0">
                    LKR {roomTotal.toLocaleString()}
                  </span>
                </div>

                {/* Service fee */}
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--color-text-secondary)]">
                    Service fee
                  </span>

                  <span className="shrink-0">
                    {serviceFee > 0
                      ? `LKR ${serviceFee.toLocaleString()}`
                      : "—"}
                  </span>
                </div>

                {/* Total */}
                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="flex justify-between font-semibold text-[var(--color-navy)]">
                    <span>Total</span>

                    <span>
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBooking}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition ${
                  loading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[var(--color-coral)] hover:bg-[var(--color-navy)]"
                }`}
              >
                <CheckCircle2 size={18} />

                {loading
                  ? "Submitting..."
                  : "Confirm booking"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
                You won't be charged yet. Your booking
                will be submitted for confirmation.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Booking;

