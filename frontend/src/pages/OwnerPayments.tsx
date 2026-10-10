import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import OwnerNavbar from "../components/OwnerNavbar";

import {
  approveOwnerPayment,
  getOwnerPendingPayments,
  rejectOwnerPayment,
  type OwnerPendingPayment,
} from "../services/paymentService";

const API_BASE_URL = "http://localhost:8080";

function OwnerPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<
    OwnerPendingPayment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [processingPaymentId, setProcessingPaymentId] =
    useState<number | null>(null);

  const [rejectingPayment, setRejectingPayment] =
    useState<OwnerPendingPayment | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [showReceipt, setShowReceipt] =
    useState<OwnerPendingPayment | null>(null);

  const [approvingPayment, setApprovingPayment] =
    useState<OwnerPendingPayment | null>(null);

  // =========================================================
  // LOAD PENDING PAYMENTS
  // =========================================================

  const loadPayments = async (
    showLoading = true
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const data =
        await getOwnerPendingPayments();

      setPayments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pending payments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadPayments();
  }, []);

  // =========================================================
  // APPROVE PAYMENT
  // =========================================================

  const openApproveModal = (
    payment: OwnerPendingPayment
  ) => {
    setApprovingPayment(payment);
    setActionError("");
    setSuccessMessage("");
  };

  const closeApproveModal = () => {
    if (
      processingPaymentId ===
      approvingPayment?.paymentId
    ) {
      return;
    }

    setApprovingPayment(null);
    setActionError("");
  };

  const handleApprove = async () => {
    if (!approvingPayment) {
      return;
    }

    try {
      setProcessingPaymentId(
        approvingPayment.paymentId
      );

      setActionError("");
      setSuccessMessage("");

      const response =
        await approveOwnerPayment(
          approvingPayment.paymentId
        );

      setSuccessMessage(
        response.message ||
        "Payment approved successfully."
      );

      setPayments((current) =>
        current.filter(
          (item) =>
            item.paymentId !==
            approvingPayment.paymentId
        )
      );

      setApprovingPayment(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to approve payment."
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // =========================================================
  // OPEN REJECT MODAL
  // =========================================================

  const openRejectModal = (
    payment: OwnerPendingPayment
  ) => {
    setRejectingPayment(payment);
    setRejectionReason("");
    setActionError("");
    setSuccessMessage("");
  };

  // =========================================================
  // REJECT PAYMENT
  // =========================================================

  const handleReject = async () => {
    if (!rejectingPayment) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setActionError(
        "Please enter a rejection reason."
      );
      return;
    }

    if (reason.length > 500) {
      setActionError(
        "Rejection reason cannot exceed 500 characters."
      );
      return;
    }

    try {
      setProcessingPaymentId(
        rejectingPayment.paymentId
      );

      setActionError("");
      setSuccessMessage("");

      const response =
        await rejectOwnerPayment(
          rejectingPayment.paymentId,
          reason
        );

      setSuccessMessage(
        response.message ||
        "Payment rejected successfully."
      );

      setPayments((current) =>
        current.filter(
          (item) =>
            item.paymentId !==
            rejectingPayment.paymentId
        )
      );

      setRejectingPayment(null);
      setRejectionReason("");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to reject payment."
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "-";
    }

    return new Date(
      dateString
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =========================================================
  // FORMAT DATE + TIME
  // =========================================================

  const formatDateTime = (
    dateString?: string | null
  ) => {
    if (!dateString) {
      return "-";
    }

    return new Date(
      dateString
    ).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (
    amount: number
  ) => {
    return `LKR ${amount.toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // RECEIPT URL
  // =========================================================

  const getReceiptUrl = (
    receiptUrl?: string | null
  ) => {
    if (!receiptUrl) {
      return "";
    }

    if (
      receiptUrl.startsWith("http://") ||
      receiptUrl.startsWith("https://")
    ) {
      return receiptUrl;
    }

    return `${API_BASE_URL}${receiptUrl}`;
  };

  // =========================================================
  // RECEIPT TYPE
  // =========================================================

  const isImageReceipt = (
    receiptUrl?: string | null
  ) => {
    if (!receiptUrl) {
      return false;
    }

    const lowerUrl =
      receiptUrl.toLowerCase();

    return (
      lowerUrl.endsWith(".jpg") ||
      lowerUrl.endsWith(".jpeg") ||
      lowerUrl.endsWith(".png") ||
      lowerUrl.endsWith(".webp")
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <OwnerNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/owner/properties")
              }
              className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)] sm:text-3xl">
              Payment Verification
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Review and verify bank transfer
              payments submitted by travelers.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadPayments(false)
            }
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <p className="text-sm font-medium text-green-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {(error || actionError) && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <XCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm font-medium text-red-700">
              {error || actionError}
            </p>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        {!loading && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                  <Clock3
                    size={21}
                    className="text-[var(--color-coral)]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Pending verification
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                    {payments.length}
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <CreditCard
                    size={21}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Pending amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                    {formatAmount(
                      payments.reduce(
                        (total, payment) =>
                          total +
                          payment.amount,
                        0
                      )
                    )}
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-[var(--color-coral)]"
            />

            <p className="mt-4 text-sm font-medium text-[var(--color-text-secondary)]">
              Loading payment submissions...
            </p>

          </div>
        ) : payments.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="rounded-2xl border border-[var(--color-border)] bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2
                size={28}
                className="text-green-600"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[var(--color-navy)]">
              No pending payments
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
              All submitted bank transfer
              payments have been reviewed.
            </p>

          </div>
        ) : (
          /* =================================================
             PAYMENT LIST
          ================================================= */

          <div className="space-y-5">

            {payments.map((payment) => (
              <div
                key={payment.paymentId}
                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
              >

                {/* Card Header */}

                <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-[var(--color-coral-light)] px-3 py-1 text-xs font-semibold text-[var(--color-coral)]">
                        Payment #{payment.paymentId}
                      </span>

                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending verification
                      </span>

                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[var(--color-navy)]">
                      {payment.propertyName}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {payment.roomName}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Payment amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-[var(--color-navy)]">
                      {formatAmount(
                        payment.amount
                      )}
                    </p>
                  </div>

                </div>

                {/* Payment Details */}

                <div className="grid grid-cols-1 gap-5 px-5 py-5 md:grid-cols-2 lg:grid-cols-4">

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Traveler
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                      {payment.travelerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Transfer reference
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-[var(--color-navy)]">
                      {payment.transferReference ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Check-in
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                      {formatDate(
                        payment.checkIn
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Check-out
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                      {formatDate(
                        payment.checkOut
                      )}
                    </p>
                  </div>

                </div>

                {/* Receipt Information */}

                <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-5 py-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                        <FileText
                          size={19}
                          className="text-[var(--color-coral)]"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--color-navy)]">
                          Payment receipt
                        </p>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Submitted{" "}
                          {formatDateTime(
                            payment.receiptSubmittedAt
                          )}
                        </p>
                      </div>

                    </div>

                    {payment.receiptUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowReceipt(
                            payment
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                      >
                        <ExternalLink
                          size={16}
                        />
                        View receipt
                      </button>
                    )}

                  </div>

                </div>

                {/* Actions */}

                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      openRejectModal(
                        payment
                      )
                    }
                    disabled={
                      processingPaymentId ===
                      payment.paymentId
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Reject payment
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openApproveModal(payment)
                    }
                    disabled={
                      processingPaymentId ===
                      payment.paymentId
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2
                      size={16}
                    />

                    {processingPaymentId ===
                      payment.paymentId
                      ? "Processing..."
                      : "Approve payment"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      {/* =====================================================
          REJECTION MODAL
      ===================================================== */}

      {rejectingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-[var(--color-border)] px-5 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-lg font-bold text-[var(--color-navy)]">
                    Reject payment
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                    Enter the reason why this
                    payment receipt cannot be
                    approved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRejectingPayment(
                      null
                    )
                  }
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
                >
                  <XCircle size={21} />
                </button>

              </div>

            </div>

            <div className="px-5 py-5">

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">

                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Payment
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                  {rejectingPayment.propertyName}
                  {" — "}
                  {formatAmount(
                    rejectingPayment.amount
                  )}
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {rejectingPayment.travelerName}
                </p>

              </div>

              <label className="mt-5 block">

                <span className="text-sm font-semibold text-[var(--color-navy)]">
                  Rejection reason
                </span>

                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  rows={5}
                  placeholder="Example: The uploaded receipt does not match the transfer amount."
                  className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {rejectionReason.length}/500
                  </span>
                </div>

              </label>

              {actionError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {actionError}
                </div>
              )}

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setRejectingPayment(
                    null
                  )
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  processingPaymentId ===
                  rejectingPayment.paymentId
                }
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingPaymentId ===
                  rejectingPayment.paymentId
                  ? "Rejecting..."
                  : "Reject payment"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
    APPROVE PAYMENT MODAL
===================================================== */}

      {approvingPayment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeApproveModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-payment-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="border-b border-[var(--color-border)] px-5 py-5">
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2
                      size={21}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <h2
                      id="approve-payment-title"
                      className="text-lg font-bold text-[var(--color-navy)]"
                    >
                      Approve payment?
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                      Please confirm that you have verified
                      this bank transfer receipt.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeApproveModal}
                  disabled={
                    processingPaymentId ===
                    approvingPayment.paymentId
                  }
                  aria-label="Close approval popup"
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)] disabled:opacity-50"
                >
                  <XCircle size={21} />
                </button>

              </div>
            </div>

            {/* DETAILS */}

            <div className="px-5 py-5">

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Traveler
                  </span>

                  <span className="text-right text-sm font-semibold text-[var(--color-navy)]">
                    {approvingPayment.travelerName}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Property
                  </span>

                  <span className="text-right text-sm font-semibold text-[var(--color-navy)]">
                    {approvingPayment.propertyName}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Room
                  </span>

                  <span className="text-right text-sm font-semibold text-[var(--color-navy)]">
                    {approvingPayment.roomName}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-3">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Amount
                  </span>

                  <span className="text-lg font-bold text-[var(--color-navy)]">
                    {formatAmount(
                      approvingPayment.amount
                    )}
                  </span>
                </div>

                {approvingPayment.transferReference && (
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Transfer reference
                    </span>

                    <span className="max-w-[200px] break-all text-right text-sm font-semibold text-[var(--color-navy)]">
                      {
                        approvingPayment.transferReference
                      }
                    </span>
                  </div>
                )}

              </div>

              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <p className="text-sm leading-5 text-green-700">
                    Approving this payment will mark it as
                    paid and confirm the traveler's booking.
                  </p>

                </div>
              </div>

              {actionError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {actionError}
                </div>
              )}

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeApproveModal}
                disabled={
                  processingPaymentId ===
                  approvingPayment.paymentId
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={
                  processingPaymentId ===
                  approvingPayment.paymentId
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />

                {processingPaymentId ===
                  approvingPayment.paymentId
                  ? "Approving..."
                  : "Approve payment"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          RECEIPT MODAL
      ===================================================== */}

      {showReceipt &&
        showReceipt.receiptUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">

            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">

                <div>
                  <h2 className="text-lg font-bold text-[var(--color-navy)]">
                    Payment receipt
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {showReceipt.transferReference ||
                      "Payment receipt"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowReceipt(null)
                  }
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
                >
                  <XCircle size={22} />
                </button>

              </div>

              <div className="flex-1 overflow-auto bg-[var(--color-background)] p-5">

                {isImageReceipt(
                  showReceipt.receiptUrl
                ) ? (
                  <img
                    src={getReceiptUrl(
                      showReceipt.receiptUrl
                    )}
                    alt="Payment receipt"
                    className="mx-auto max-h-[65vh] max-w-full rounded-xl border border-[var(--color-border)] bg-white object-contain shadow-sm"
                  />
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-8 text-center">

                    <FileText
                      size={42}
                      className="text-[var(--color-coral)]"
                    />

                    <h3 className="mt-4 text-base font-bold text-[var(--color-navy)]">
                      PDF receipt
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
                      Open the submitted PDF
                      receipt in a new tab to
                      review it.
                    </p>

                    <a
                      href={getReceiptUrl(
                        showReceipt.receiptUrl
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy-dark)]"
                    >
                      <ExternalLink
                        size={16}
                      />
                      Open PDF receipt
                    </a>

                  </div>
                )}

              </div>

              <div className="flex justify-end border-t border-[var(--color-border)] px-5 py-4">

                <a
                  href={getReceiptUrl(
                    showReceipt.receiptUrl
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)]"
                >
                  <ExternalLink
                    size={16}
                  />
                  Open in new tab
                </a>

              </div>

            </div>

          </div>
        )}
    </div>
  );
}

export default OwnerPayments;