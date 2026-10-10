import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  MapPin,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";
import {
  confirmBooking,
  getOwnerBooking,
  rejectBooking,
  type OwnerBookingResponse,
} from "../services/ownerBookingService";

const OwnerBookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [booking, setBooking] =
    useState<OwnerBookingResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirming, setConfirming] = useState(false);

  const [showRejectPopup, setShowRejectPopup] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [rejecting, setRejecting] = useState(false);

  const [actionError, setActionError] = useState("");

  // =========================================================
  // LOAD BOOKING
  // =========================================================

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getOwnerBooking(Number(id));

        setBooking(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  // =========================================================
  // CALCULATE NIGHTS
  // =========================================================

  const nights = useMemo(() => {
    if (!booking) return 0;

    const checkIn = new Date(
      `${booking.checkIn}T00:00:00`
    );

    const checkOut = new Date(
      `${booking.checkOut}T00:00:00`
    );

    const difference =
      checkOut.getTime() - checkIn.getTime();

    return Math.max(
      0,
      Math.round(
        difference / (1000 * 60 * 60 * 24)
      )
    );
  }, [booking]);

  // =========================================================
  // STATUS STYLES
  // =========================================================

  const statusStyles: Record<string, string> = {
    PENDING:
      "bg-orange-50 text-orange-700 border-orange-200",

    CONFIRMED:
      "bg-blue-50 text-blue-700 border-blue-200",

    COMPLETED:
      "bg-green-50 text-green-700 border-green-200",

    CANCELLED:
      "bg-gray-100 text-gray-600 border-gray-200",

    REJECTED:
      "bg-red-50 text-red-700 border-red-200",
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =========================================================
  // CONFIRM BOOKING
  // =========================================================

  const handleConfirm = async () => {
    if (!booking) return;

    try {
      setConfirming(true);
      setActionError("");

      const updatedBooking =
        await confirmBooking(booking.id);

      setBooking(updatedBooking);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to confirm booking."
      );
    } finally {
      setConfirming(false);
    }
  };

  // =========================================================
  // OPEN REJECT POPUP
  // =========================================================

  const openRejectPopup = () => {
    setActionError("");
    setRejectionReason("");
    setShowRejectPopup(true);
  };

  // =========================================================
  // CLOSE REJECT POPUP
  // =========================================================

  const closeRejectPopup = () => {
    if (rejecting) return;

    setShowRejectPopup(false);
    setRejectionReason("");
    setActionError("");
  };

  // =========================================================
  // REJECT BOOKING
  // =========================================================

  const handleReject = async () => {
    if (!booking) return;

    const cleanedReason = rejectionReason.trim();

    if (!cleanedReason) {
      setActionError(
        "Please provide a rejection reason."
      );
      return;
    }

    if (cleanedReason.length > 500) {
      setActionError(
        "Rejection reason cannot exceed 500 characters."
      );
      return;
    }

    try {
      setRejecting(true);
      setActionError("");

      const updatedBooking =
        await rejectBooking(
          booking.id,
          cleanedReason
        );

      setBooking(updatedBooking);

      setShowRejectPopup(false);
      setRejectionReason("");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to reject booking."
      );
    } finally {
      setRejecting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-lg bg-gray-200" />

            <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6">
              <div className="h-6 w-64 rounded bg-gray-200" />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate("/owner/bookings")
            }
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)]"
          >
            <ArrowLeft size={18} />
            Back to bookings
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <XCircle
              size={42}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-bold text-red-700">
              Unable to load booking
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error || "Booking not found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/owner/bookings")
              }
              className="mt-6 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-coral)]"
            >
              Back to bookings
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isPending =
    booking.status === "PENDING";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/owner/bookings")
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] transition hover:text-[var(--color-coral)]"
        >
          <ArrowLeft size={18} />
          Back to bookings
        </button>

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Booking #{booking.id}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-navy)] sm:text-3xl">
              Booking Details
            </h1>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-semibold ${
              statusStyles[booking.status] ||
              "border-gray-200 bg-gray-100 text-gray-600"
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* MAIN CARD */}

        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">

          {/* PROPERTY HEADER */}

          <div className="border-b border-[var(--color-border)] p-6 sm:p-8">
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                <Home size={24} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Property
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--color-navy)]">
                  {booking.propertyName}
                </h2>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                  <MapPin size={15} />
                  {booking.roomName}
                </p>
              </div>

            </div>
          </div>

          {/* DETAILS */}

          <div className="p-6 sm:p-8">

            {/* =================================================
                TRAVELER INFORMATION
            ================================================== */}

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)] text-[var(--color-coral)]">
                  <User size={19} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Traveler
                  </p>

                  <p className="mt-1 text-base font-bold text-[var(--color-navy)]">
                    {booking.travelerName}
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-[var(--color-border)] pt-4">

                <Mail
                  size={17}
                  className="shrink-0 text-[var(--color-text-secondary)]"
                />

                <p className="text-sm text-[var(--color-text-secondary)]">
                  {booking.travelerEmail}
                </p>

              </div>

            </div>

            {/* STAY INFORMATION */}

            <h3 className="mt-8 text-base font-bold text-[var(--color-navy)]">
              Stay information
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* CHECK IN */}

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Check-in
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>

                </div>
              </div>

              {/* CHECK OUT */}

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Check-out
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>

                </div>
              </div>

              {/* NIGHTS */}

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Clock3 size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                      {nights}{" "}
                      {nights === 1
                        ? "night"
                        : "nights"}
                    </p>
                  </div>

                </div>
              </div>

              {/* GUESTS */}

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Users size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Guests
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                      {booking.guests}{" "}
                      {booking.guests === 1
                        ? "guest"
                        : "guests"}
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* PAYMENT SUMMARY */}

            <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white">

              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Room
                </span>

                <span className="text-sm font-semibold text-[var(--color-navy)]">
                  {booking.roomName}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-5">

                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    Total booking amount
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {nights}{" "}
                    {nights === 1
                      ? "night"
                      : "nights"}
                  </p>
                </div>

                <p className="text-2xl font-bold text-[var(--color-coral)]">
                  LKR{" "}
                  {booking.totalPrice.toLocaleString()}
                </p>

              </div>
            </div>

            {/* REJECTION REASON */}

            {booking.status === "REJECTED" &&
              booking.rejectionReason && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                  <p className="text-sm font-bold text-red-700">
                    Rejection reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-600">
                    {booking.rejectionReason}
                  </p>

                </div>
              )}

            {/* ACTION ERROR */}

            {actionError && !showRejectPopup && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-600">
                  {actionError}
                </p>
              </div>
            )}

            {/* PENDING ACTIONS */}

            {isPending && (
              <div className="mt-8 border-t border-[var(--color-border)] pt-6">

                <h3 className="text-base font-bold text-[var(--color-navy)]">
                  Booking actions
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Review this booking request and choose whether to confirm or reject it.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    disabled={
                      confirming || rejecting
                    }
                    onClick={handleConfirm}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                      confirming || rejecting
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-[var(--color-coral)] hover:bg-[var(--color-navy)]"
                    }`}
                  >
                    <CheckCircle2 size={18} />

                    {confirming
                      ? "Confirming..."
                      : "Confirm Booking"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      confirming || rejecting
                    }
                    onClick={openRejectPopup}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                      confirming || rejecting
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <XCircle size={18} />
                    Reject Booking
                  </button>

                </div>
              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-5 sm:px-8">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Booking ID
                </p>

                <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                  #{booking.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/bookings")
                }
                className="rounded-xl border border-[var(--color-navy)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-navy)] hover:text-white"
              >
                Back to bookings
              </button>

            </div>

          </div>

        </div>
      </main>

      {/* REJECT BOOKING MODAL */}

      {showRejectPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-[var(--color-navy)]">
                  Reject booking
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Please provide a reason for rejecting this booking.
                </p>
              </div>

              <button
                type="button"
                disabled={rejecting}
                onClick={closeRejectPopup}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* TRAVELER SUMMARY */}

            <div className="mt-6 rounded-2xl bg-[var(--color-background)] p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Traveler
              </p>

              <p className="mt-1 text-sm font-bold text-[var(--color-navy)]">
                {booking.travelerName}
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {booking.travelerEmail}
              </p>

            </div>

            {/* REASON */}

            <div className="mt-5">

              <label
                htmlFor="rejectionReason"
                className="text-sm font-semibold text-[var(--color-navy)]"
              >
                Rejection reason
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => {
                  setRejectionReason(
                    event.target.value
                  );
                  setActionError("");
                }}
                maxLength={500}
                rows={5}
                placeholder="Enter the reason for rejecting this booking..."
                disabled={rejecting}
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/10 disabled:bg-gray-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {rejectionReason.length}/500
                </span>
              </div>

            </div>

            {actionError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {actionError}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                disabled={rejecting}
                onClick={closeRejectPopup}
                className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  rejecting ||
                  !rejectionReason.trim()
                }
                onClick={handleReject}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                  rejecting ||
                  !rejectionReason.trim()
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {rejecting
                  ? "Rejecting..."
                  : "Reject booking"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookingDetails;