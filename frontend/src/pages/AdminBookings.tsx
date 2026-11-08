import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { getAdminBookings } from "../services/adminService";
import type { AdminBooking } from "../services/adminService";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

function formatDate(dateString: string) {
  if (!dateString) return "—";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatDateTime(dateString: string) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500";

    case "CONFIRMED":
      return "bg-blue-500";

    case "COMPLETED":
      return "bg-emerald-500";

    case "CANCELLED":
      return "bg-slate-400";

    case "REJECTED":
      return "bg-red-500";

    default:
      return "bg-slate-400";
  }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminBookings();

      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        booking.travelerName.toLowerCase().includes(search) ||
        booking.travelerEmail.toLowerCase().includes(search) ||
        booking.propertyName.toLowerCase().includes(search) ||
        booking.roomName.toLowerCase().includes(search) ||
        String(booking.id).includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => booking.status === "PENDING"
      ).length,
      confirmed: bookings.filter(
        (booking) => booking.status === "CONFIRMED"
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "COMPLETED"
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === "CANCELLED"
      ).length,
      rejected: bookings.filter(
        (booking) => booking.status === "REJECTED"
      ).length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Manage Bookings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              View and monitor all bookings made across the
              StayBy platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.5 9A7.5 7.5 0 0118.5 6M18.5 15A7.5 7.5 0 015.5 18"
              />
            </svg>

            Refresh
          </button>
        </div>

{/* Summary Cards */}
<div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
  {/* Total */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path
          strokeLinecap="round"
          d="M7 8h10M7 12h10M7 16h6"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.total}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Total Bookings
      </p>
    </div>
  </div>

  {/* Pending */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path
          strokeLinecap="round"
          d="M12 7v5l3 2"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.pending}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Pending
      </p>
    </div>
  </div>

  {/* Confirmed */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8.5 12 2.2 2.2 4.8-5"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.confirmed}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Confirmed
      </p>
    </div>
  </div>

  {/* Completed */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 6 9 17l-5-5"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.completed}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Completed
      </p>
    </div>
  </div>

  {/* Cancelled */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          d="m8 8 8 8M16 8l-8 8"
        />
        <circle cx="12" cy="12" r="8.5" />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.cancelled}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Cancelled
      </p>
    </div>
  </div>

  {/* Rejected */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
      <svg
        className="h-4.5 w-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path
          strokeLinecap="round"
          d="m9 9 6 6M15 9l-6 6"
        />
      </svg>
    </div>

    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-[var(--color-heading)]">
        {summary.rejected}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">
        Rejected
      </p>
    </div>
  </div>
</div>


        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  d="m20 20-4-4"
                />
              </svg>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search traveler, property, room, email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-full lg:w-52">
              <label
                htmlFor="booking-status"
                className="sr-only"
              >
                Filter by booking status
              </label>

              <select
                id="booking-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StatusFilter
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--color-primary)]" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading bookings...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path
                  strokeLinecap="round"
                  d="M12 8v5M12 16h.01"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-red-800">
              Unable to load bookings
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadBookings}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                />
                <path
                  strokeLinecap="round"
                  d="M7 8h10M7 12h6"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No bookings found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Traveler
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Property
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stay
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Guests
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Booking */}
                      <td className="px-5 py-5 align-top">
                        <div>
                          <p className="font-semibold text-[var(--color-heading)]">
                            #{booking.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Room #{booking.roomId}
                          </p>
                        </div>
                      </td>

                      {/* Traveler */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                            {booking.travelerName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {booking.travelerName}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {booking.travelerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-5 py-5 align-top">
                        <div>
                          <p className="max-w-[210px] truncate text-sm font-semibold text-slate-800">
                            {booking.propertyName}
                          </p>

                          <p className="mt-1 max-w-[210px] truncate text-xs text-slate-500">
                            {booking.roomName}
                          </p>
                        </div>
                      </td>

                      {/* Stay */}
                      <td className="px-5 py-5 align-top">
                        <div className="text-sm">
                          <p className="font-medium text-slate-700">
                            {formatDate(booking.checkIn)}
                          </p>

                          <div className="my-1 flex items-center gap-2 text-xs text-slate-400">
                            <span className="h-px w-4 bg-slate-300" />
                            to
                            <span className="h-px w-4 bg-slate-300" />
                          </div>

                          <p className="font-medium text-slate-700">
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg
                            className="h-4 w-4 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <circle cx="9" cy="8" r="3" />
                            <path
                              strokeLinecap="round"
                              d="M3.5 19c.5-3 2.3-5 5.5-5s5 2 5.5 5"
                            />
                            <path
                              strokeLinecap="round"
                              d="M16 11a2.5 2.5 0 1 0 0-5"
                            />
                            <path
                              strokeLinecap="round"
                              d="M17 14c2 .4 3.2 2 3.5 4"
                            />
                          </svg>

                          {booking.guests}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-5 align-top">
                        <p className="text-sm font-bold text-[var(--color-heading)]">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5 align-top">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              booking.status
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                booking.status
                              )}`}
                            />

                            {booking.status}
                          </span>

                          {booking.status === "REJECTED" &&
                            booking.rejectionReason && (
                              <p
                                className="mt-2 max-w-[180px] text-xs leading-5 text-red-600"
                                title={
                                  booking.rejectionReason
                                }
                              >
                                Reason:{" "}
                                {booking.rejectionReason}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-5 align-top">
                        <p className="whitespace-nowrap text-sm text-slate-600">
                          {formatDateTime(
                            booking.createdAt
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PHONE / SMALL SCREENS: one card per booking */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-heading)]">
                        Booking #{booking.id}
                      </p>

                      <p className="text-xs text-slate-400">
                        Room #{booking.roomId} · created{" "}
                        {formatDateTime(booking.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          booking.status
                        )}`}
                      />
                      {booking.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.propertyName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {booking.roomName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                      {booking.travelerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {booking.travelerName}
                      </p>

                      <p className="break-all text-xs text-slate-500">
                        {booking.travelerEmail}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                    <div>
                      <p className="text-slate-400">Check-in</p>
                      <p className="font-medium text-slate-700">
                        {formatDate(booking.checkIn)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Check-out</p>
                      <p className="font-medium text-slate-700">
                        {formatDate(booking.checkOut)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Guests</p>
                      <p className="font-medium text-slate-700">
                        {booking.guests}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Amount</p>

                    <p className="text-sm font-bold text-[var(--color-heading)]">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>

                  {booking.status === "REJECTED" &&
                    booking.rejectionReason && (
                      <p className="text-xs leading-5 text-red-600">
                        Reason: {booking.rejectionReason}
                      </p>
                    )}
                </div>
              ))}
            </div>

            {/* Table Footer */}
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredBookings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {bookings.length}
                </span>{" "}
                bookings
              </p>

              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

