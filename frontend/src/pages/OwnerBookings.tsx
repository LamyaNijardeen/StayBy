import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";
import {
  confirmBooking,
  getOwnerBookings,
  rejectBooking,
  type OwnerBookingResponse,
} from "../services/ownerBookingService";

function OwnerBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<OwnerBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmingId, setConfirmingId] =
    useState<number | null>(null);

  const [rejectingId, setRejectingId] =
    useState<number | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<OwnerBookingResponse | null>(null);

  const [selectedRejectBooking, setSelectedRejectBooking] =
    useState<OwnerBookingResponse | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  // =========================================================
  // FILTER STATE
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOwnerBookings();

        setBookings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking requests."
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
      difference / (1000 * 60 * 60 * 24)
    );
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return {
          className: "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "REJECTED":
        return {
          className: "bg-red-100 text-red-600",
          icon: <XCircle size={15} />,
        };

      case "CANCELLED":
        return {
          className: "bg-red-100 text-red-600",
          icon: <XCircle size={15} />,
        };

      case "COMPLETED":
        return {
          className: "bg-blue-100 text-blue-700",
          icon: <CheckCircle2 size={15} />,
        };

      default:
        return {
          className: "bg-yellow-100 text-yellow-700",
          icon: <Clock3 size={15} />,
        };
    }
  };

  // =========================================================
  // FILTER BOOKINGS
  // =========================================================

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        booking.propertyName
          .toLowerCase()
          .includes(search) ||
        booking.roomName
          .toLowerCase()
          .includes(search) ||
        booking.travelerName
          .toLowerCase()
          .includes(search) ||
        booking.travelerEmail
          .toLowerCase()
          .includes(search) ||
        booking.id.toString().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status.toUpperCase() === statusFilter;

      const matchesDate =
        !dateFilter ||
        booking.checkIn === dateFilter ||
        booking.checkOut === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    bookings,
    searchTerm,
    statusFilter,
    dateFilter,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFilter("");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "ALL" ||
    dateFilter !== "";

  // =========================================================
  // CONFIRM BOOKING
  // =========================================================

  const handleConfirmBooking = async () => {
    if (!selectedBooking) {
      return;
    }

    try {
      setConfirmingId(selectedBooking.id);
      setError("");

      const updatedBooking =
        await confirmBooking(selectedBooking.id);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === updatedBooking.id
            ? updatedBooking
            : booking
        )
      );

      setSelectedBooking(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm booking."
      );
    } finally {
      setConfirmingId(null);
    }
  };

  // =========================================================
  // OPEN REJECT POPUP
  // =========================================================

  const openRejectPopup = (
    booking: OwnerBookingResponse
  ) => {
    setSelectedRejectBooking(booking);
    setRejectionReason("");
    setError("");
  };

  // =========================================================
  // CLOSE REJECT POPUP
  // =========================================================

  const closeRejectPopup = () => {
    if (rejectingId !== null) {
      return;
    }

    setSelectedRejectBooking(null);
    setRejectionReason("");
  };

  // =========================================================
  // REJECT BOOKING
  // =========================================================

  const handleRejectBooking = async () => {
    if (!selectedRejectBooking) {
      return;
    }

    const cleanedReason =
      rejectionReason.trim();

    if (!cleanedReason) {
      setError("Please enter a rejection reason.");
      return;
    }

    if (cleanedReason.length > 500) {
      setError(
        "Rejection reason cannot exceed 500 characters."
      );
      return;
    }

    try {
      setRejectingId(selectedRejectBooking.id);
      setError("");

      const updatedBooking =
        await rejectBooking(
          selectedRejectBooking.id,
          cleanedReason
        );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === updatedBooking.id
            ? updatedBooking
            : booking
        )
      );

      setSelectedRejectBooking(null);
      setRejectionReason("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject booking."
      );
    } finally {
      setRejectingId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <main className="mx-auto flex min-h-96 max-w-7xl items-center justify-center px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Loading booking requests...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <OwnerNavbar />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* ===================================================
            HEADING
        ==================================================== */}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)] sm:text-sm">
            Owner dashboard
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
                Booking requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                Review and manage bookings for your properties.
              </p>
            </div>

            {bookings.length > 0 && (
              <div className="text-sm text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-navy)]">
                  {filteredBookings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--color-navy)]">
                  {bookings.length}
                </span>{" "}
                bookings
              </div>
            )}

          </div>
        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ===================================================
            FILTERS
        ==================================================== */}

        {!error && bookings.length > 0 && (
          <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-5">

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={17}
                className="text-[var(--color-coral)]"
              />

              <h2 className="text-sm font-semibold text-[var(--color-navy)]">
                Find bookings
              </h2>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

              {/* Search */}

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search property, room, traveler or booking ID..."
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />
              </div>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
              >
                <option value="ALL">
                  All statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

                <option value="REJECTED">
                  Rejected
                </option>
              </select>

              {/* Date */}

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
              />

              {/* Clear */}

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={16} />
                Clear
              </button>

            </div>

            {hasActiveFilters && (
              <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                Showing {filteredBookings.length} matching{" "}
                {filteredBookings.length === 1
                  ? "booking"
                  : "bookings"}.
              </p>
            )}

          </section>
        )}

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {!error && bookings.length === 0 && (
          <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm sm:p-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
              <CalendarDays
                size={26}
                className="text-[var(--color-coral)]"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
              No booking requests
            </h2>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              You don't have any booking requests yet.
            </p>

          </div>
        )}

        {/* ===================================================
            NO FILTER RESULTS
        ==================================================== */}

        {!error &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm sm:p-10">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-background)]">
                <Search
                  size={25}
                  className="text-[var(--color-text-secondary)]"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[var(--color-navy)]">
                No matching bookings
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
              >
                Clear filters
              </button>

            </div>
          )}

        {/* ===================================================
            BOOKING LIST
        ==================================================== */}

        {!error &&
          filteredBookings.length > 0 && (
            <div className="mt-8 space-y-5 sm:mt-10">

              {filteredBookings.map((booking) => {
                const nights = calculateNights(
                  booking.checkIn,
                  booking.checkOut
                );

                const status =
                  getStatusStyle(booking.status);

                const isPending =
                  booking.status.toUpperCase() ===
                  "PENDING";

                const isConfirming =
                  confirmingId === booking.id;

                const isRejecting =
                  rejectingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* =====================================
                          BOOKING INFORMATION
                      ====================================== */}

                      <div className="min-w-0 flex-1">

                        {/* PROPERTY + STATUS */}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                          <h2 className="text-lg font-semibold text-[var(--color-navy)] sm:text-xl">
                            {booking.propertyName}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.icon}
                            {booking.status}
                          </span>

                        </div>

                        {/* ROOM */}

                        <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                          <MapPin
                            size={15}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {booking.roomName}
                          </span>
                        </p>

                        {/* =====================================
                            TRAVELER INFORMATION
                        ====================================== */}

                        <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                            Traveler
                          </p>

                          <div className="mt-2">

                            <p className="text-sm font-semibold text-[var(--color-navy)]">
                              {booking.travelerName}
                            </p>

                            <p className="mt-1 break-all text-sm text-[var(--color-text-secondary)]">
                              {booking.travelerEmail}
                            </p>

                          </div>

                        </div>

                        {/* =====================================
                            BOOKING DETAILS
                        ====================================== */}

                        <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:gap-5">

                          {/* CHECK-IN */}

                          <div>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                              CHECK-IN
                            </p>

                            <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                              {booking.checkIn}
                            </p>
                          </div>

                          {/* CHECK-OUT */}

                          <div>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                              CHECK-OUT
                            </p>

                            <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                              {booking.checkOut}
                            </p>
                          </div>

                          {/* GUESTS */}

                          <div>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                              GUESTS
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                              <Users size={15} />

                              {booking.guests}{" "}
                              {booking.guests === 1
                                ? "guest"
                                : "guests"}
                            </p>
                          </div>

                        </div>

                        {/* =====================================
                            REJECTION REASON
                        ====================================== */}

                        {booking.status.toUpperCase() ===
                          "REJECTED" &&
                          booking.rejectionReason && (
                            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                Rejection reason
                              </p>

                              <p className="mt-1 text-sm leading-5 text-red-700">
                                {booking.rejectionReason}
                              </p>

                            </div>
                          )}

                      </div>

                      {/* =====================================
                          PRICE + ACTION
                      ====================================== */}

                      <div className="shrink-0 border-t border-[var(--color-border)] pt-5 lg:min-w-[190px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">

                        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          {nights}{" "}
                          {nights === 1
                            ? "night"
                            : "nights"}
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                          LKR{" "}
                          {booking.totalPrice.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Booking #{booking.id}
                        </p>

                        {/* VIEW DETAILS */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/owner/bookings/${booking.id}`
                            )
                          }
                          className="mt-4 flex w-full items-center justify-center rounded-xl border border-[var(--color-navy)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-navy)] hover:text-white"
                        >
                          View details
                        </button>

                        {/* CONFIRM + REJECT */}

                        {isPending && (
                          <div className="mt-3 grid grid-cols-2 gap-2">

                            {/* CONFIRM */}

                            <button
                              type="button"
                              disabled={
                                isConfirming ||
                                isRejecting
                              }
                              onClick={() =>
                                setSelectedBooking(
                                  booking
                                )
                              }
                              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition sm:text-sm ${
                                isConfirming ||
                                isRejecting
                                  ? "cursor-not-allowed bg-gray-400"
                                  : "bg-[var(--color-coral)] hover:bg-[var(--color-navy)]"
                              }`}
                            >
                              <CheckCircle2 size={16} />

                              {isConfirming
                                ? "Confirming..."
                                : "Confirm"}
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              disabled={
                                isConfirming ||
                                isRejecting
                              }
                              onClick={() =>
                                openRejectPopup(
                                  booking
                                )
                              }
                              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                                isConfirming ||
                                isRejecting
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              <XCircle size={16} />

                              {isRejecting
                                ? "Rejecting..."
                                : "Reject"}
                            </button>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </main>

      {/* =====================================================
          CONFIRMATION POPUP
      ====================================================== */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">

          <div className="my-auto w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-6">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2
                    size={23}
                    className="text-green-600"
                  />
                </div>

                <div className="min-w-0">

                  <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                    Confirm booking
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    Booking #{selectedBooking.id}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                disabled={confirmingId !== null}
                className="shrink-0 rounded-full p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* BOOKING SUMMARY */}

            <div className="mt-6 rounded-xl bg-[var(--color-background)] p-4">

              <p className="text-sm font-semibold text-[var(--color-navy)]">
                {selectedBooking.propertyName}
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {selectedBooking.roomName}
              </p>

              {/* TRAVELER */}

              <div className="mt-4 border-t border-[var(--color-border)] pt-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Traveler
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                  {selectedBooking.travelerName}
                </p>

                <p className="mt-1 break-all text-sm text-[var(--color-text-secondary)]">
                  {selectedBooking.travelerEmail}
                </p>

              </div>

              {/* DETAILS */}

              <div className="mt-4 space-y-3 text-sm">

                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">

                  <span className="text-[var(--color-text-secondary)]">
                    Dates
                  </span>

                  <span className="font-medium text-[var(--color-text)] sm:text-right">
                    {selectedBooking.checkIn} →{" "}
                    {selectedBooking.checkOut}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[var(--color-text-secondary)]">
                    Guests
                  </span>

                  <span className="font-medium text-[var(--color-text)]">
                    {selectedBooking.guests}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[var(--color-text-secondary)]">
                    Total
                  </span>

                  <span className="font-semibold text-[var(--color-navy)]">
                    LKR{" "}
                    {selectedBooking.totalPrice.toLocaleString()}
                  </span>

                </div>

              </div>

            </div>

            {/* CONFIRM MESSAGE */}

            <p className="mt-5 text-sm leading-5 text-[var(--color-text-secondary)]">

              Are you sure you want to confirm this booking?

              The booking status will change from{" "}

              <span className="font-semibold text-yellow-700">
                PENDING
              </span>{" "}

              to{" "}

              <span className="font-semibold text-green-700">
                CONFIRMED
              </span>
              .

            </p>

            {/* ACTIONS */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                disabled={confirmingId !== null}
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={confirmingId !== null}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                  confirmingId !== null
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[var(--color-coral)] hover:bg-[var(--color-navy)]"
                }`}
              >
                {confirmingId !== null
                  ? "Confirming..."
                  : "Yes, confirm"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REJECTION POPUP
      ====================================================== */}

      {selectedRejectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">

          <div className="my-auto w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-6">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <XCircle
                    size={23}
                    className="text-red-600"
                  />
                </div>

                <div className="min-w-0">

                  <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                    Reject booking
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    Booking #{selectedRejectBooking.id}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeRejectPopup}
                disabled={rejectingId !== null}
                className="shrink-0 rounded-full p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-navy)] disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* BOOKING SUMMARY */}

            <div className="mt-6 rounded-xl bg-[var(--color-background)] p-4">

              <p className="text-sm font-semibold text-[var(--color-navy)]">
                {selectedRejectBooking.propertyName}
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {selectedRejectBooking.roomName}
              </p>

              {/* TRAVELER */}

              <div className="mt-4 border-t border-[var(--color-border)] pt-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Traveler
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                  {selectedRejectBooking.travelerName}
                </p>

                <p className="mt-1 break-all text-sm text-[var(--color-text-secondary)]">
                  {selectedRejectBooking.travelerEmail}
                </p>

              </div>

              {/* DETAILS */}

              <div className="mt-4 space-y-3 text-sm">

                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">

                  <span className="text-[var(--color-text-secondary)]">
                    Dates
                  </span>

                  <span className="text-right font-medium text-[var(--color-text)]">
                    {selectedRejectBooking.checkIn} →{" "}
                    {selectedRejectBooking.checkOut}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-[var(--color-text-secondary)]">
                    Guests
                  </span>

                  <span className="font-medium text-[var(--color-text)]">
                    {selectedRejectBooking.guests}
                  </span>

                </div>

              </div>

            </div>

            {/* REJECTION REASON */}

            <div className="mt-5">

              <label
                htmlFor="rejectionReason"
                className="text-sm font-semibold text-[var(--color-navy)]"
              >
                Reason for rejection
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                maxLength={500}
                rows={4}
                placeholder="Please explain why you are rejecting this booking..."
                disabled={rejectingId !== null}
                className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)] disabled:bg-gray-100"
              />

              <div className="mt-1 flex justify-end">

                <span className="text-xs text-[var(--color-text-secondary)]">
                  {rejectionReason.length}/500
                </span>

              </div>

            </div>

            <p className="mt-3 text-sm leading-5 text-[var(--color-text-secondary)]">
              This reason will be saved with the booking and
              can be shown to the traveler.
            </p>

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={closeRejectPopup}
                disabled={rejectingId !== null}
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectBooking}
                disabled={rejectingId !== null}
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                  rejectingId !== null
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {rejectingId !== null
                  ? "Rejecting..."
                  : "Reject booking"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default OwnerBookings;
