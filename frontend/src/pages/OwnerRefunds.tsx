import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";

import OwnerNavbar from "../components/OwnerNavbar";

import {
  completeRefund,
  failRefund,
  getOwnerRefunds,
  type RefundResponse,
} from "../services/refundService";

export default function OwnerRefunds() {
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [processingRefundId, setProcessingRefundId] =
    useState<number | null>(null);

  const [completeRefundId, setCompleteRefundId] =
    useState<number | null>(null);

  const [refundReference, setRefundReference] =
    useState("");

  const [failRefundId, setFailRefundId] =
    useState<number | null>(null);

  const [failureReason, setFailureReason] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  // =========================================================
  // LOAD REFUNDS
  // =========================================================

  const loadRefunds = async () => {
    try {
      setError("");

      const data = await getOwnerRefunds();

      setRefunds(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load refunds."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRefunds();
  };

  // =========================================================
  // COMPLETE REFUND
  // =========================================================

  const handleCompleteRefund = async () => {
    if (completeRefundId === null) {
      return;
    }

    if (!refundReference.trim()) {
      setActionError("Refund reference is required.");
      return;
    }

    if (refundReference.trim().length > 100) {
      setActionError(
        "Refund reference cannot exceed 100 characters."
      );
      return;
    }

    try {
      setProcessingRefundId(completeRefundId);
      setActionError("");

      await completeRefund(
        completeRefundId,
        refundReference.trim()
      );

      setCompleteRefundId(null);
      setRefundReference("");

      await loadRefunds();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to complete refund."
      );
    } finally {
      setProcessingRefundId(null);
    }
  };

  // =========================================================
  // FAIL REFUND
  // =========================================================

  const handleFailRefund = async () => {
    if (failRefundId === null) {
      return;
    }

    if (!failureReason.trim()) {
      setActionError("Failure reason is required.");
      return;
    }

    if (failureReason.trim().length > 500) {
      setActionError(
        "Failure reason cannot exceed 500 characters."
      );
      return;
    }

    try {
      setProcessingRefundId(failRefundId);
      setActionError("");

      await failRefund(
        failRefundId,
        failureReason.trim()
      );

      setFailRefundId(null);
      setFailureReason("");

      await loadRefunds();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update refund."
      );
    } finally {
      setProcessingRefundId(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusClasses = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <OwnerNavbar />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-coral)] border-t-transparent" />

            <p className="text-sm text-[var(--color-secondary)]">
              Loading refunds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Refunds
            </h1>

            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              Manage refund requests for your properties.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--color-secondary)]">
              Total refunds
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {refunds.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-700">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-800">
              {
                refunds.filter(
                  (refund) =>
                    refund.status.toUpperCase() === "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm text-emerald-700">
              Completed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {
                refunds.filter(
                  (refund) =>
                    refund.status.toUpperCase() === "COMPLETED"
                ).length
              }
            </p>
          </div>
        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {refunds.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <RefreshCw className="mx-auto h-10 w-10 text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              No refunds yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-secondary)]">
              Refund requests will appear here when a
              traveler cancels a paid booking.
            </p>
          </div>
        ) : (
          /* ===================================================
             REFUND LIST
          =================================================== */

          <div className="space-y-4">
            {refunds.map((refund) => {
              const isPending =
                refund.status.toUpperCase() === "PENDING";

              const isProcessing =
                processingRefundId === refund.id;

              return (
                <div
                  key={refund.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base font-bold text-[var(--color-text)]">
                          Refund #{refund.id}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            refund.status
                          )}`}
                        >
                          {refund.status.toUpperCase() ===
                          "PENDING" ? (
                            <Clock3 className="h-3.5 w-3.5" />
                          ) : refund.status.toUpperCase() ===
                            "COMPLETED" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}

                          {refund.status}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Booking
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            #{refund.bookingId}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Payment
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            #{refund.paymentId}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Refund amount
                          </p>

                          <p className="mt-1 text-sm font-bold text-[var(--color-coral)]">
                            Rs.{" "}
                            {refund.amount.toLocaleString(
                              "en-LK",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Requested
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            {formatDate(refund.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-xs font-medium text-[var(--color-secondary)]">
                          Reason
                        </p>

                        <p className="mt-1 text-sm text-[var(--color-text)]">
                          {refund.reason || "-"}
                        </p>
                      </div>

                      {refund.refundReference && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Refund reference
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                            {refund.refundReference}
                          </p>
                        </div>
                      )}

                      {refund.processedAt && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-[var(--color-secondary)]">
                            Processed
                          </p>

                          <p className="mt-1 text-sm text-[var(--color-secondary)]">
                            {formatDate(refund.processedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    {isPending && (
                      <div className="flex w-full flex-col gap-2 lg:w-48">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setCompleteRefundId(refund.id);
                            setRefundReference("");
                            setActionError("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />

                          Complete refund
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setFailRefundId(refund.id);
                            setFailureReason("");
                            setActionError("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />

                          Mark as failed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          COMPLETE REFUND MODAL
      ========================================================= */}

      {completeRefundId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Complete refund
            </h2>

            <p className="mt-2 text-sm text-[var(--color-secondary)]">
              Enter the bank transfer reference after
              you have sent the refund to the traveler.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Refund reference
              </span>

              <input
                type="text"
                value={refundReference}
                onChange={(event) =>
                  setRefundReference(event.target.value)
                }
                maxLength={100}
                placeholder="Enter transfer reference"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20"
              />
            </label>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCompleteRefundId(null);
                  setRefundReference("");
                  setActionError("");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCompleteRefund}
                disabled={processingRefundId !== null}
                className="rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingRefundId !== null
                  ? "Processing..."
                  : "Complete refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FAIL REFUND MODAL
      ========================================================= */}

      {failRefundId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Mark refund as failed
            </h2>

            <p className="mt-2 text-sm text-[var(--color-secondary)]">
              Enter the reason why the refund could not
              be completed.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Failure reason
              </span>

              <textarea
                value={failureReason}
                onChange={(event) =>
                  setFailureReason(event.target.value)
                }
                maxLength={500}
                rows={4}
                placeholder="Enter failure reason"
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {failureReason.length}/500
              </div>
            </label>

            {actionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFailRefundId(null);
                  setFailureReason("");
                  setActionError("");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleFailRefund}
                disabled={processingRefundId !== null}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingRefundId !== null
                  ? "Processing..."
                  : "Mark as failed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}