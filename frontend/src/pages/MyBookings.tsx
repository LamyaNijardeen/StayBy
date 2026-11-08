import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  cancelBooking,
  getMyBookings,
  type BookingResponse,
} from "../services/bookingService";

import {
  createReview,
  getReviewForBooking,
} from "../services/reviewService";

import TravelerNavbar from "../components/TravelerNavbar";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] =
    useState<BookingResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState<number | null>(null);

  const [bookingToCancel, setBookingToCancel] =
    useState<BookingResponse | null>(null);

  // =========================================================
  // REVIEW STATE
  // =========================================================

  const [reviewedBookings, setReviewedBookings] =
    useState<number[]>([]);

  const [reviewBooking, setReviewBooking] =
    useState<BookingResponse | null>(null);

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  // =========================================================
  // BOOKING FILTER
  // =========================================================

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const filteredBookings =
    selectedStatus === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.status.toUpperCase() ===
            selectedStatus
        );

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyBookings();

        setBookings(data);

        // Check which completed bookings have already
        // been reviewed.
        const completedBookings = data.filter(
          (booking) =>
            booking.status.toUpperCase() ===
            "COMPLETED"
        );

        const reviewResults =
          await Promise.all(
            completedBookings.map(
              async (booking) => {
                try {
                  await getReviewForBooking(
                    booking.id
                  );

                  return booking.id;
                } catch {
                  return null;
                }
              }
            )
          );

        setReviewedBookings(
          reviewResults.filter(
            (id): id is number =>
              id !== null
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  // =========================================================
  // CALCULATE NIGHTS
  // =========================================================

  const calculateNights = (
    checkIn: string,
    checkOut: string
  ) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
      end.getTime() - start.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (
    status: string
  ) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return {
          className:
            "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "CANCELLED":
        return {
          className:
            "bg-red-100 text-red-600",
          icon: <XCircle size={15} />,
        };

      case "COMPLETED":
        return {
          className:
            "bg-blue-100 text-blue-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "REJECTED":
        return {
          className:
            "bg-[var(--color-coral-light)] text-[var(--color-coral)]",
          icon: <XCircle size={15} />,
        };

      default:
        return {
          className:
            "bg-yellow-100 text-yellow-700",
          icon: <Clock3 size={15} />,
        };
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelClick = (
    booking: BookingResponse
  ) => {
    setError("");
    setBookingToCancel(booking);
  };

  const closeCancelPopup = () => {
    if (cancellingId === null) {
      setBookingToCancel(null);
    }
  };

  const confirmCancelBooking =
    async () => {
      if (!bookingToCancel) {
        return;
      }

      try {
        setCancellingId(
          bookingToCancel.id
        );

        setError("");

        await cancelBooking(
          bookingToCancel.id
        );

        const updatedBookings =
          await getMyBookings();

        setBookings(updatedBookings);
        setBookingToCancel(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to cancel booking."
        );
      } finally {
        setCancellingId(null);
      }
    };

  // =========================================================
  // REVIEW
  // =========================================================

  const openReviewPopup = (
    booking: BookingResponse
  ) => {
    setReviewBooking(booking);
    setSelectedRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const closeReviewPopup = () => {
    if (!submittingReview) {
      setReviewBooking(null);
      setSelectedRating(0);
      setReviewComment("");
      setReviewError("");
    }
  };

  const submitReview = async () => {
    if (!reviewBooking) {
      return;
    }

    if (
      selectedRating < 1 ||
      selectedRating > 5
    ) {
      setReviewError(
        "Please select a rating."
      );
      return;
    }

    if (
      reviewComment.trim().length > 2000
    ) {
      setReviewError(
        "Review cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      await createReview(
        reviewBooking.id,
        reviewBooking.propertyId,
        selectedRating,
        reviewComment
      );

      setReviewedBookings(
        (current) => [
          ...current,
          reviewBooking.id,
        ]
      );

      setReviewBooking(null);
      setSelectedRating(0);
      setReviewComment("");
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Loading your bookings...
        </p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Header */}
      <TravelerNavbar />

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

        {/* Heading */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Your stays
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            My bookings
          </h1>

          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            View and manage your accommodation
            bookings.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error &&
          bookings.length === 0 && (
            <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                <CalendarDays
                  size={26}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
                No bookings yet
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                You haven't made any bookings
                yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/search")
                }
                className="mt-6 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                Find a place to stay
              </button>

            </div>
          )}

        {/* Booking list */}
        {!error &&
          bookings.length > 0 && (
            <div className="mt-10">

              {/* STATUS FILTERS */}
              <div className="mb-6 flex flex-wrap items-center gap-2">

                {[
                  {
                    label: "All",
                    value: "ALL",
                  },
                  {
                    label: "Pending",
                    value: "PENDING",
                  },
                  {
                    label: "Confirmed",
                    value: "CONFIRMED",
                  },
                  {
                    label: "Completed",
                    value: "COMPLETED",
                  },
                  {
                    label: "Cancelled",
                    value: "CANCELLED",
                  },
                  {
                    label: "Rejected",
                    value: "REJECTED",
                  },
                ].map((filter) => {
                  const isSelected =
                    selectedStatus ===
                    filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() =>
                        setSelectedStatus(
                          filter.value
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}

              </div>

              {/* NO BOOKINGS FOR SELECTED FILTER */}
              {filteredBookings.length ===
                0 && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                    <CalendarDays
                      size={26}
                      className="text-[var(--color-coral)]"
                    />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
                    No{" "}
                    {selectedStatus.toLowerCase()}{" "}
                    bookings
                  </h2>

                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    You don't have any bookings
                    with this status.
                  </p>

                </div>
              )}

              {/* FILTERED BOOKING LIST */}
              {filteredBookings.length >
                0 && (
                <div className="space-y-5">

                  {filteredBookings.map(
                    (booking) => {
                      const nights =
                        calculateNights(
                          booking.checkIn,
                          booking.checkOut
                        );

                      const status =
                        getStatusStyle(
                          booking.status
                        );

                      const canCancel =
                        booking.status
                          .toUpperCase() ===
                          "PENDING" ||
                        booking.status
                          .toUpperCase() ===
                          "CONFIRMED";

                      const isCancelling =
                        cancellingId ===
                        booking.id;

                      const isCompleted =
                        booking.status
                          .toUpperCase() ===
                        "COMPLETED";

                      const hasReviewed =
                        reviewedBookings.includes(
                          booking.id
                        );

                      return (
                        <div
                          key={booking.id}
                          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
                        >

                          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            {/* Booking information */}
                            <div className="flex-1">

                              <div className="flex flex-wrap items-center gap-3">

                                <h2 className="text-xl font-semibold text-[var(--color-navy)]">
                                  {
                                    booking.propertyName
                                  }
                                </h2>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.icon}
                                  {
                                    booking.status
                                  }
                                </span>

                              </div>

                              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                                <MapPin
                                  size={15}
                                />
                                {
                                  booking.roomName
                                }
                              </p>

                              {/* Dates */}
                              <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">

                                <div>
                                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    CHECK-IN
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                                    {
                                      booking.checkIn
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    CHECK-OUT
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                                    {
                                      booking.checkOut
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    GUESTS
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                                    {
                                      booking.guests
                                    }{" "}
                                    {
                                      booking.guests ===
                                      1
                                        ? "guest"
                                        : "guests"
                                    }
                                  </p>
                                </div>

                              </div>

                              {/* Rejection reason */}
                              {booking.status
                                .toUpperCase() ===
                                "REJECTED" &&
                                booking.rejectionReason && (
                                  <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">

                                    <div className="flex items-start gap-3">

                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                                        <XCircle
                                          size={
                                            16
                                          }
                                          className="text-[var(--color-coral)]"
                                        />
                                      </div>

                                      <div className="min-w-0">

                                        <p className="text-sm font-semibold text-[var(--color-navy)]">
                                          Booking
                                          rejected
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                                          {
                                            booking.rejectionReason
                                          }
                                        </p>

                                      </div>

                                    </div>

                                  </div>
                                )}

                            </div>

                            {/* Price and actions */}
                            <div className="shrink-0 border-t border-[var(--color-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">

                              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                {
                                  nights
                                }{" "}
                                {
                                  nights ===
                                  1
                                    ? "night"
                                    : "nights"
                                }
                              </p>

                              <p className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                                LKR{" "}
                                {booking.totalPrice.toLocaleString()}
                              </p>

                              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                Booking #
                                {
                                  booking.id
                                }
                              </p>

                              {/* View details button */}
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/my-bookings/${booking.id}`
                                  )
                                }
                                className="mt-4 flex w-full items-center justify-center rounded-xl border border-[var(--color-navy)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-navy)] hover:text-white"
                              >
                                View details
                              </button>

                              {/* Review button */}
                              {isCompleted && (
                                <>
                                  {hasReviewed ? (
                                    <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                                      <CheckCircle2
                                        size={
                                          17
                                        }
                                      />
                                      Reviewed
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openReviewPopup(
                                          booking
                                        )
                                      }
                                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
                                    >
                                      <Star
                                        size={
                                          17
                                        }
                                        fill="currentColor"
                                      />
                                      Write a
                                      review
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Cancel button */}
                              {canCancel && (
                                <button
                                  type="button"
                                  disabled={
                                    isCancelling
                                  }
                                  onClick={() =>
                                    handleCancelClick(
                                      booking
                                    )
                                  }
                                  className={`mt-4 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                                    isCancelling
                                      ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                      : "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  {isCancelling
                                    ? "Cancelling..."
                                    : "Cancel booking"}
                                </button>
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>
          )}

      </main>

      {/* =====================================================
          CANCEL CONFIRMATION POPUP
          ===================================================== */}

      {bookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={closeCancelPopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Close button */}
            <button
              type="button"
              onClick={closeCancelPopup}
              disabled={
                cancellingId !== null
              }
              aria-label="Close cancellation popup"
              className="absolute right-5 top-5 rounded-full text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={24} />
            </button>

            {/* Title */}
            <h2
              id="cancel-booking-title"
              className="pr-10 text-xl font-semibold text-[var(--color-navy)]"
            >
              Cancel booking?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Are you sure you want to cancel
              your booking at{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {
                  bookingToCancel.propertyName
                }
              </span>
              ?
            </p>

            {/* =================================================
                REFUND NOTICE
                Only shown for confirmed/paid bookings
                ================================================= */}

            {bookingToCancel.status
              .trim()
              .toUpperCase() ===
              "CONFIRMED" && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <div className="flex items-start gap-3">

                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>

                    <p className="text-sm font-semibold text-amber-800">
                      Refund will be
                      requested
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      This booking has
                      already been paid
                      for. If you cancel
                      it, a refund
                      request will be
                      created
                      automatically. The
                      property owner
                      will process the
                      refund separately.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* Booking details */}
            <div className="mt-5 rounded-xl bg-[var(--color-background)] p-4">

              <div className="flex justify-between gap-4 text-sm">

                <span className="text-[var(--color-text-secondary)]">
                  Room
                </span>

                <span className="text-right font-medium text-[var(--color-text)]">
                  {
                    bookingToCancel.roomName
                  }
                </span>

              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm">

                <span className="text-[var(--color-text-secondary)]">
                  Dates
                </span>

                <span className="text-right font-medium text-[var(--color-text)]">
                  {
                    bookingToCancel.checkIn
                  }{" "}
                  →{" "}
                  {
                    bookingToCancel.checkOut
                  }
                </span>

              </div>

            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={closeCancelPopup}
                disabled={
                  cancellingId !== null
                }
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep booking
              </button>

              <button
                type="button"
                onClick={
                  confirmCancelBooking
                }
                disabled={
                  cancellingId !== null
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {cancellingId !== null
                  ? "Cancelling..."
                  : "Yes, cancel"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          WRITE REVIEW POPUP
          ===================================================== */}

      {reviewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={closeReviewPopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-booking-title"
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Close button */}
            <button
              type="button"
              onClick={closeReviewPopup}
              disabled={
                submittingReview
              }
              aria-label="Close review popup"
              className="absolute right-5 top-5 rounded-full text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={24} />
            </button>

            {/* Title */}
            <h2
              id="review-booking-title"
              className="pr-10 text-xl font-semibold text-[var(--color-navy)]"
            >
              Write a review
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Share your experience at{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {
                  reviewBooking.propertyName
                }
              </span>
              .
            </p>

            {/* Rating */}
            <div className="mt-6">

              <p className="text-sm font-semibold text-[var(--color-navy)]">
                Your rating
              </p>

              <div className="mt-3 flex items-center gap-2">

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={
                        submittingReview
                      }
                      onClick={() =>
                        setSelectedRating(
                          star
                        )
                      }
                      aria-label={`Rate ${star} out of 5`}
                      className="rounded-lg p-1 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Star
                        size={30}
                        className={
                          star <=
                          selectedRating
                            ? "text-[var(--color-coral)]"
                            : "text-gray-300"
                        }
                        fill={
                          star <=
                          selectedRating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  )
                )}

              </div>

              {selectedRating >
                0 && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {selectedRating ===
                    1 && "Poor"}
                  {selectedRating ===
                    2 && "Fair"}
                  {selectedRating ===
                    3 && "Good"}
                  {selectedRating ===
                    4 && "Very good"}
                  {selectedRating ===
                    5 && "Excellent"}
                </p>
              )}

            </div>

            {/* Comment */}
            <div className="mt-6">

              <div className="flex items-center justify-between">

                <label
                  htmlFor="review-comment"
                  className="text-sm font-semibold text-[var(--color-navy)]"
                >
                  Your review
                </label>

                <span className="text-xs text-[var(--color-text-secondary)]">
                  {
                    reviewComment.length
                  }
                  /2000
                </span>

              </div>

              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) =>
                  setReviewComment(
                    e.target.value
                  )
                }
                disabled={
                  submittingReview
                }
                maxLength={2000}
                rows={5}
                placeholder="Tell others about your stay..."
                className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

            {/* Review error */}
            {reviewError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {reviewError}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={
                  closeReviewPopup
                }
                disabled={
                  submittingReview
                }
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReview}
                disabled={
                  submittingReview ||
                  selectedRating === 0
                }
                className="flex-1 rounded-xl bg-[var(--color-coral)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit review"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyBookings;