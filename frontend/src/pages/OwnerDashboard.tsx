import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  ArrowRight,
  Users,
  Star,
  Banknote,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";

import {
  getMyProperties,
  type OwnerPropertyResponse,
} from "../services/ownerPropertyService";

import {
  getOwnerBookings,
  type OwnerBookingResponse,
} from "../services/ownerBookingService";

import {
  getPropertyReviews,
  type ReviewResponse,
} from "../services/reviewService";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<
    OwnerPropertyResponse[]
  >([]);

  const [bookings, setBookings] = useState<
    OwnerBookingResponse[]
  >([]);

  const [propertyReviews, setPropertyReviews] = useState<
    Record<number, ReviewResponse[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [propertyData, bookingData] =
          await Promise.all([
            getMyProperties(),
            getOwnerBookings(),
          ]);

        setProperties(propertyData);
        setBookings(bookingData);

        /*
         * Load reviews for each owner's property.
         *
         * If one property's reviews cannot be loaded,
         * the other properties will still work normally.
         */
        const reviewResults = await Promise.all(
          propertyData.map(async (property) => {
            try {
              const reviews = await getPropertyReviews(
                property.id
              );

              return {
                propertyId: property.id,
                reviews,
              };
            } catch {
              return {
                propertyId: property.id,
                reviews: [],
              };
            }
          })
        );

        const reviewMap: Record<
          number,
          ReviewResponse[]
        > = {};

        reviewResults.forEach((result) => {
          reviewMap[result.propertyId] = result.reviews;
        });

        setPropertyReviews(reviewMap);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================================================
     BASIC DASHBOARD STATS
     ========================================================= */

  const totalProperties = properties.length;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status.toUpperCase() === "PENDING"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      booking.status.toUpperCase() === "CONFIRMED"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status.toUpperCase() === "COMPLETED"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status.toUpperCase() === "CANCELLED" ||
      booking.status.toUpperCase() === "REJECTED"
  ).length;

  /* =========================================================
     REVENUE ANALYTICS
     =========================================================

     Revenue is counted only from confirmed and completed
     bookings. Pending, cancelled and rejected bookings
     are not counted as revenue.
  */

  const revenueBookings = bookings.filter((booking) => {
    const status = booking.status.toUpperCase();

    return (
      status === "CONFIRMED" ||
      status === "COMPLETED"
    );
  });

  const totalRevenue = revenueBookings.reduce(
    (sum, booking) =>
      sum + Number(booking.totalPrice || 0),
    0
  );

  /* =========================================================
     MONTHLY ANALYTICS
     ========================================================= */

  const currentYear = new Date().getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyBookingCounts = monthNames.map(
    (_, monthIndex) => {
      return bookings.filter((booking) => {
        const date = new Date(booking.checkIn);

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === monthIndex
        );
      }).length;
    }
  );

  const maxMonthlyBookings = Math.max(
    ...monthlyBookingCounts,
    1
  );

  /* =========================================================
     REVIEWS
     ========================================================= */

  const allReviews = Object.values(
    propertyReviews
  ).flat();

  const totalReviews = allReviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          allReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : null;

  const fiveStarReviews = allReviews.filter(
    (review) => review.rating === 5
  ).length;

  /* =========================================================
     RECENT BOOKINGS
     ========================================================= */

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.checkIn).getTime() -
        new Date(a.checkIn).getTime()
    )
    .slice(0, 5);

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return {
          className: "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={14} />,
        };

      case "COMPLETED":
        return {
          className: "bg-blue-100 text-blue-700",
          icon: <CheckCircle2 size={14} />,
        };

      case "CANCELLED":
        return {
          className: "bg-red-100 text-red-600",
          icon: <Clock3 size={14} />,
        };

      case "REJECTED":
        return {
          className: "bg-red-100 text-red-600",
          icon: <Clock3 size={14} />,
        };

      default:
        return {
          className: "bg-yellow-100 text-yellow-700",
          icon: <Clock3 size={14} />,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <main className="mx-auto flex min-h-96 max-w-7xl items-center justify-center px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Loading your dashboard...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Owner dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)] sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Manage your properties, keep track of bookings,
              and stay on top of your accommodation activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/owner/properties/new")
            }
            className="flex w-fit items-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
          >
            <Plus size={17} />
            Add property
          </button>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            MAIN STATS
        ===================================================== */}

        <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

          {/* Properties */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Properties
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-navy)]">
                  {totalProperties}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                <Building2
                  size={21}
                  className="text-[var(--color-coral)]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/owner/properties")
              }
              className="mt-5 flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
            >
              Manage properties
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Bookings */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Total bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-navy)]">
                  {totalBookings}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays
                  size={21}
                  className="text-blue-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/owner/bookings")
              }
              className="mt-5 flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
            >
              View bookings
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Pending requests
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-navy)]">
                  {pendingBookings}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50">
                <Clock3
                  size={21}
                  className="text-yellow-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/owner/bookings")
              }
              className="mt-5 flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
            >
              Review requests
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Confirmed */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-[var(--color-navy)]">
                  {confirmedBookings}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2
                  size={21}
                  className="text-green-600"
                />
              </div>
            </div>

            <p className="mt-5 text-xs text-[var(--color-text-secondary)]">
              Confirmed booking requests
            </p>
          </div>

        </section>

        {/* =====================================================
            BOOKING & REVENUE ANALYTICS
        ===================================================== */}

        <section className="mt-8">

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

            {/* Section header */}
            <div className="border-b border-[var(--color-border)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <BarChart3
                    size={20}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-[var(--color-navy)]">
                    Booking & Revenue Overview
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    An overview of your booking activity and earnings
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">

              {/* Analytics cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

                {/* Confirmed */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Confirmed bookings
                    </p>

                    <CheckCircle2
                      size={17}
                      className="text-green-600"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-[var(--color-navy)]">
                    {confirmedBookings}
                  </p>
                </div>

                {/* Completed */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Completed stays
                    </p>

                    <CheckCircle2
                      size={17}
                      className="text-blue-600"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-[var(--color-navy)]">
                    {completedBookings}
                  </p>
                </div>

                {/* Cancelled */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Cancelled / rejected
                    </p>

                    <Clock3
                      size={17}
                      className="text-red-500"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-[var(--color-navy)]">
                    {cancelledBookings}
                  </p>
                </div>

                {/* Revenue */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Total revenue
                    </p>

                    <Banknote
                      size={18}
                      className="text-[var(--color-coral)]"
                    />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-[var(--color-navy)]">
                    LKR {totalRevenue.toLocaleString()}
                  </p>
                </div>

              </div>

              {/* Monthly activity */}
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

                {/* Chart */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                        Monthly booking activity
                      </h3>

                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Bookings based on check-in date
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                      {currentYear}
                    </span>
                  </div>

                  <div className="mt-6">

                    {/* Bars */}
                    <div className="flex h-48 items-end gap-2 sm:gap-3">

                      {monthlyBookingCounts.map(
                        (count, index) => {

                          const height =
                            count === 0
                              ? 4
                              : Math.max(
                                  (count /
                                    maxMonthlyBookings) *
                                    100,
                                  10
                                );

                          return (
                            <div
                              key={monthNames[index]}
                              className="group flex h-full flex-1 flex-col items-center justify-end"
                            >

                              <div className="relative flex w-full flex-1 items-end justify-center">

                                {/* Tooltip */}
                                {count > 0 && (
                                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-navy)] px-2.5 py-1.5 text-[10px] font-semibold text-white opacity-0 shadow-md transition group-hover:opacity-100">
                                    {count}{" "}
                                    {count === 1
                                      ? "booking"
                                      : "bookings"}
                                  </div>
                                )}

                                <div
                                  className="w-full max-w-8 rounded-t-md bg-[var(--color-coral)] transition-all duration-300 group-hover:bg-[var(--color-navy)]"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              </div>

                              <span className="mt-3 text-[10px] font-medium text-[var(--color-text-secondary)]">
                                {monthNames[index]}
                              </span>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                </div>

                {/* Revenue summary */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">

                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
                      <Banknote
                        size={18}
                        className="text-[var(--color-coral)]"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                        Revenue
                      </h3>

                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        Confirmed & completed
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                    LKR {totalRevenue.toLocaleString()}
                  </p>

                  <div className="mt-5 space-y-3">

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Confirmed
                      </span>

                      <span className="text-xs font-semibold text-[var(--color-navy)]">
                        {confirmedBookings}
                      </span>
                    </div>

                    <div className="h-px bg-[var(--color-border)]" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Completed
                      </span>

                      <span className="text-xs font-semibold text-[var(--color-navy)]">
                        {completedBookings}
                      </span>
                    </div>

                    <div className="h-px bg-[var(--color-border)]" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Total revenue bookings
                      </span>

                      <span className="text-xs font-semibold text-[var(--color-coral)]">
                        {revenueBookings.length}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            REVIEWS SUMMARY
        ===================================================== */}

        <section className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

            <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-[var(--color-navy)]">
                  Reviews & Ratings
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Feedback from travelers who stayed at your properties
                </p>
              </div>

              {totalReviews > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/owner/properties")
                  }
                  className="flex w-fit items-center gap-1 text-xs font-semibold text-[var(--color-coral)] transition hover:text-[var(--color-navy)]"
                >
                  View property reviews
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {totalReviews === 0 ? (
              <div className="flex min-h-36 items-center justify-center px-6">
                <div className="text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                    <Star
                      size={20}
                      className="text-[var(--color-coral)]"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">
                    No reviews yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Traveler reviews will appear here after completed stays.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-6 sm:grid-cols-3">

                {/* Average Rating */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
                      <Star
                        size={18}
                        className="fill-[var(--color-coral)] text-[var(--color-coral)]"
                      />
                    </div>

                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Average rating
                    </p>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-bold text-[var(--color-navy)]">
                      {averageRating}
                    </span>

                    <span className="mb-1 text-sm text-[var(--color-text-secondary)]">
                      / 5
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className={
                            averageRating &&
                            index <
                              Math.round(
                                Number(averageRating)
                              )
                              ? "fill-[var(--color-coral)] text-[var(--color-coral)]"
                              : "text-gray-300"
                          }
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Total Reviews */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <Star
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Total reviews
                    </p>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-[var(--color-navy)]">
                    {totalReviews}
                  </p>

                  <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    Across all your properties
                  </p>
                </div>

                {/* Five Star Reviews */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
                      <Star
                        size={18}
                        className="fill-yellow-500 text-yellow-500"
                      />
                    </div>

                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      5-star reviews
                    </p>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-[var(--color-navy)]">
                    {fiveStarReviews}
                  </p>

                  <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                    Excellent ratings received
                  </p>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            MAIN DASHBOARD CONTENT
        ===================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

          {/* Recent bookings */}
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <h2 className="font-semibold text-[var(--color-navy)]">
                  Recent bookings
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Latest booking activity for your properties
                </p>
              </div>

              {bookings.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/owner/bookings")
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--color-coral)] hover:text-[var(--color-navy)]"
                >
                  View all
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {recentBookings.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center px-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                    <CalendarDays
                      size={21}
                      className="text-[var(--color-coral)]"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[var(--color-navy)]">
                    No bookings yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Booking activity will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {recentBookings.map((booking) => {
                  const status = getStatusStyle(
                    booking.status
                  );

                  return (
                    <div
                      key={booking.id}
                      className="px-6 py-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-[var(--color-navy)]">
                              {booking.propertyName}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                            >
                              {status.icon}
                              {booking.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            {booking.roomName}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {booking.checkIn} →{" "}
                              {booking.checkOut}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Users size={13} />
                              {booking.guests}{" "}
                              {booking.guests === 1
                                ? "guest"
                                : "guests"}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-sm font-bold text-[var(--color-navy)]">
                            LKR{" "}
                            {booking.totalPrice.toLocaleString()}
                          </p>

                          <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                            #{booking.id}
                          </p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">

            <div>
              <h2 className="font-semibold text-[var(--color-navy)]">
                Quick actions
              </h2>

              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Common owner tasks
              </p>
            </div>

            <div className="mt-6 space-y-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/properties/new")
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] p-4 text-left transition hover:border-[var(--color-coral)] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <Plus
                    size={19}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    Add property
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    List a new accommodation
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-coral)]"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/properties")
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] p-4 text-left transition hover:border-[var(--color-coral)] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Building2
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    Manage properties
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Edit properties and rooms
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-coral)]"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/owner/bookings")
                }
                className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] p-4 text-left transition hover:border-[var(--color-coral)] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <CalendarDays
                    size={19}
                    className="text-green-600"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    Manage bookings
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Review booking requests
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-coral)]"
                />
              </button>

            </div>

            {/* Property summary */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-6">

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Property status
                </p>

                <MapPin
                  size={16}
                  className="text-[var(--color-coral)]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--color-background)] p-4">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Verified
                  </p>

                  <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
                    {
                      properties.filter(
                        (property) => property.verified
                      ).length
                    }
                  </p>
                </div>

                <div className="h-8 w-px bg-[var(--color-border)]" />

                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Pending
                  </p>

                  <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
                    {
                      properties.filter(
                        (property) => !property.verified
                      ).length
                    }
                  </p>
                </div>

                <div className="h-8 w-px bg-[var(--color-border)]" />

                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-bold text-[var(--color-navy)]">
                    {totalProperties}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default OwnerDashboard;
