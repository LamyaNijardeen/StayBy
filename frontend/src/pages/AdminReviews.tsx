import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Search,
  Star,
  Trash2,
  User,
  Building2,
} from "lucide-react";

import AdminNavbar from "../components/AdminNavbar";

import {
  deleteAdminReview,
  getAdminReviews,
} from "../services/adminService";

import type { AdminReview } from "../services/adminService";
import ErrorPopup from "../components/ErrorPopup";

type RatingFilter = "ALL" | "5" | "4" | "3" | "2" | "1";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRatingLabel(rating: number) {
  return `${rating} ${rating === 1 ? "Star" : "Stars"}`;
}

function RatingStars({
  rating,
}: {
  rating: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-[var(--color-coral)] text-[var(--color-coral)]"
              : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] =
    useState<RatingFilter>("ALL");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [reviewToDelete, setReviewToDelete] =
    useState<AdminReview | null>(null);

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReviews();

      setReviews(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredReviews = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !search ||
        review.travelerName
          .toLowerCase()
          .includes(search) ||
        review.travelerEmail
          .toLowerCase()
          .includes(search) ||
        review.propertyName
          .toLowerCase()
          .includes(search) ||
        review.comment
          ?.toLowerCase()
          .includes(search);

      const matchesRating =
        ratingFilter === "ALL" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [
    reviews,
    searchTerm,
    ratingFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / total
        : 0;

    const fiveStar = reviews.filter(
      (review) => review.rating === 5
    ).length;

    const fourStar = reviews.filter(
      (review) => review.rating === 4
    ).length;

    const lowerRated = reviews.filter(
      (review) => review.rating <= 3
    ).length;

    return {
      total,
      average,
      fiveStar,
      fourStar,
      lowerRated,
    };
  }, [reviews]);

  // =========================================================
  // DELETE
  // =========================================================

  const openDeletePopup = (review: AdminReview) => {
    setError("");
    setReviewToDelete(review);
  };

  const closeDeletePopup = () => {
    if (deletingId === null) {
      setReviewToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) {
      return;
    }

    try {
      setDeletingId(reviewToDelete.id);
      setError("");

      await deleteAdminReview(
        reviewToDelete.id
      );

      setReviews((current) =>
        current.filter(
          (review) =>
            review.id !== reviewToDelete.id
        )
      );

      setReviewToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete review."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <AdminNavbar />

        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading reviews...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-navy)]">
              Manage Reviews
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Monitor traveler reviews and feedback
              across StayBy properties.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        <ErrorPopup message={error} onClose={() => setError("")} />

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-coral-light)]">
              <MessageSquare className="h-4 w-4 text-[var(--color-coral)]" />
            </div>

            <div>
              <p className="text-xl font-bold leading-none text-[var(--color-navy)]">
                {summary.total}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total Reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>

            <div>
              <p className="text-xl font-bold leading-none text-[var(--color-navy)]">
                {summary.average.toFixed(1)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Average Rating
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Star className="h-4 w-4 fill-green-600 text-green-600" />
            </div>

            <div>
              <p className="text-xl font-bold leading-none text-[var(--color-navy)]">
                {summary.fiveStar}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                5-Star Reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
            </div>

            <div>
              <p className="text-xl font-bold leading-none text-[var(--color-navy)]">
                {summary.fourStar}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                4-Star Reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </div>

            <div>
              <p className="text-xl font-bold leading-none text-[var(--color-navy)]">
                {summary.lowerRated}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                3-Star & Below
              </p>
            </div>
          </div>

        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative w-full lg:max-w-md">

              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search traveler, property or review..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* Rating */}

            <div className="w-full lg:w-52">

              <label
                htmlFor="review-rating"
                className="sr-only"
              >
                Filter by rating
              </label>

              <select
                id="review-rating"
                value={ratingFilter}
                onChange={(event) =>
                  setRatingFilter(
                    event.target.value as RatingFilter
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              >
                <option value="ALL">
                  All Ratings
                </option>

                <option value="5">
                  5 Stars
                </option>

                <option value="4">
                  4 Stars
                </option>

                <option value="3">
                  3 Stars
                </option>

                <option value="2">
                  2 Stars
                </option>

                <option value="1">
                  1 Star
                </option>
              </select>

            </div>

          </div>
        </div>

        {/* =====================================================
            REVIEWS TABLE
        ====================================================== */}

        {filteredReviews.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-navy)]">
              No reviews found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or rating filter.
            </p>

            {(searchTerm || ratingFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRatingFilter("ALL");
                }}
                className="mt-5 text-sm font-semibold text-[var(--color-coral)] hover:underline"
              >
                Clear filters
              </button>
            )}

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Traveler
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Property
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rating
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Review
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredReviews.map((review) => (

                    <tr
                      key={review.id}
                      className="transition hover:bg-slate-50/60"
                    >

                      {/* Traveler */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                            <User className="h-4 w-4 text-[var(--color-coral)]" />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--color-navy)]">
                              {review.travelerName}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {review.travelerEmail}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Booking #{review.bookingId}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Property */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <Building2 className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[190px] truncate text-sm font-medium text-slate-700">
                              {review.propertyName}
                            </p>

                            <p className="text-xs text-slate-400">
                              Property #{review.propertyId}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Rating */}

                      <td className="px-5 py-4">

                        <div className="flex flex-col gap-1">

                          <RatingStars
                            rating={review.rating}
                          />

                          <span className="text-xs font-medium text-slate-500">
                            {getRatingLabel(
                              review.rating
                            )}
                          </span>

                        </div>

                      </td>

                      {/* Review */}

                      <td className="px-5 py-4">

                        <div className="max-w-[330px]">

                          {review.comment ? (
                            <p className="line-clamp-3 text-sm leading-5 text-slate-600">
                              "{review.comment}"
                            </p>
                          ) : (
                            <span className="text-sm italic text-slate-400">
                              No written comment
                            </span>
                          )}

                        </div>

                      </td>

                      {/* Date */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          {formatDate(
                            review.createdAt
                          )}

                        </div>

                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openDeletePopup(review)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* PHONE / SMALL SCREENS: one card per review */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredReviews.map((review) => (
                <div key={review.id} className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-light)]">
                        <User className="h-4 w-4 text-[var(--color-coral)]" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--color-navy)]">
                          {review.travelerName}
                        </p>

                        <p className="break-all text-xs text-slate-500">
                          {review.travelerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <RatingStars rating={review.rating} />

                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {getRatingLabel(review.rating)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="font-medium">
                      {review.propertyName}
                    </span>
                  </div>

                  {review.comment ? (
                    <p className="text-sm leading-5 text-slate-600">
                      "{review.comment}"
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      No written comment
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {formatDate(review.createdAt)} · Booking #
                      {review.bookingId}
                    </span>

                    <button
                      type="button"
                      onClick={() => openDeletePopup(review)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}

            <div className="border-t border-slate-200 px-5 py-3">

              <p className="text-xs text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">
                  {filteredReviews.length}
                </span>{" "}

                of{" "}

                <span className="font-semibold text-slate-700">
                  {reviews.length}
                </span>{" "}

                reviews

              </p>

            </div>

          </div>

        )}

      </main>

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {reviewToDelete && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[var(--color-navy)]">
              Delete this review?
            </h2>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              This will permanently remove the review
              from StayBy. This action cannot be undone.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {reviewToDelete.travelerName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {reviewToDelete.propertyName}
                  </p>
                </div>

                <RatingStars
                  rating={reviewToDelete.rating}
                />

              </div>

              {reviewToDelete.comment && (
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                  "{reviewToDelete.comment}"
                </p>
              )}

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeDeletePopup}
                disabled={deletingId !== null}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Review
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminReviews;

