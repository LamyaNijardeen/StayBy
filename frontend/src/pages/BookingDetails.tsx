import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  Star,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import TravelerNavbar from "../components/TravelerNavbar";

import {
  cancelBooking,
  getBooking,
  type BookingResponse,
} from "../services/bookingService";

import {
  createReview,
  getReviewForBooking,
} from "../services/reviewService";

import {
  createPayHereCheckout,
  getBankDetails,
  getPaymentForBooking,
  uploadBankTransferReceipt,
} from "../services/paymentService";

import {
  getTravelerRefund,
  type RefundResponse,
} from "../services/refundService";

import type {
  BankDetails,
  PaymentResponse,
} from "../services/paymentService";

const DEFAULT_LOCATION: [number, number] = [
  7.8731,
  80.7718,
];

const API_BASE_URL = "http://localhost:8080";

function MapCenterUpdater({
  position,
}: {
  position: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] =
    useState<BookingResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // CANCEL STATE
  // =========================================================

  const [bookingToCancel, setBookingToCancel] =
    useState<BookingResponse | null>(null);

  const [cancelling, setCancelling] =
    useState(false);

  const [cancelError, setCancelError] =
    useState("");

  // =========================================================
  // REVIEW STATE
  // =========================================================

  const [hasReviewed, setHasReviewed] =
    useState(false);

  const [reviewBooking, setReviewBooking] =
    useState(false);

  const [selectedRating, setSelectedRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  // =========================================================
  // PAYMENT STATE
  // =========================================================

  const [paymentMethod, setPaymentMethod] =
    useState<"BANK_TRANSFER" | "PAYHERE" | null>(
      null
    );

  const [bankDetails, setBankDetails] =
    useState<BankDetails | null>(null);

  const [loadingBankDetails, setLoadingBankDetails] =
    useState(false);

  const [bankDetailsError, setBankDetailsError] =
    useState("");

  const [transferReference, setTransferReference] =
    useState("");

  const [receiptFile, setReceiptFile] =
    useState<File | null>(null);

  const [uploadingReceipt, setUploadingReceipt] =
    useState(false);

  const [receiptSuccess, setReceiptSuccess] =
    useState(false);

  const [receiptError, setReceiptError] =
    useState("");

  const [payHereLoading, setPayHereLoading] =
    useState(false);

  const [payHereError, setPayHereError] =
    useState("");

  const [existingPayment, setExistingPayment] =
    useState<PaymentResponse | null>(null);

  const [loadingExistingPayment, setLoadingExistingPayment] =
    useState(false);

  const [replaceReceipt, setReplaceReceipt] =
    useState(false);

  const [wasRejected, setWasRejected] =
    useState(false);

  const paymentSectionRef =
    useRef<HTMLDivElement | null>(null);

  // =========================================================
  // REFUND STATE
  // =========================================================

  const [refund, setRefund] =
    useState<RefundResponse | null>(null);

  // =========================================================
  // LOAD BOOKING
  // =========================================================

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        setExistingPayment(null);
        setWasRejected(false);
        setReplaceReceipt(false);
        setReceiptSuccess(false);
        setReceiptError("");
        setRefund(null);

        const bookingId = Number(id);

        if (!id || Number.isNaN(bookingId)) {
          setError("Invalid booking ID.");
          return;
        }

        const data =
          await getBooking(bookingId);

        setBooking(data);

        // ---------------------------------------------------------
        // Load refund information
        // ---------------------------------------------------------

        try {
          const refundData =
            await getTravelerRefund(data.id);

          setRefund(refundData);
        } catch (refundError) {
          console.error(
            "Failed to load refund:",
            refundError
          );

          setRefund(null);
        }

        // ---------------------------------------------------------
        // Load existing payment information
        //
        // We load payment information for all bookings, not only
        // AWAITING_PAYMENT bookings. This allows the cancellation
        // popup to correctly identify paid bookings.
        // ---------------------------------------------------------

        try {
          setLoadingExistingPayment(true);

          const payment =
            await getPaymentForBooking(data.id);

          setExistingPayment(payment);

          if (
            payment.status.toUpperCase() ===
            "FAILED"
          ) {
            setWasRejected(true);
          } else {
            setWasRejected(false);
          }
        } catch {
          setExistingPayment(null);
          setWasRejected(false);
        } finally {
          setLoadingExistingPayment(false);
        }

        // ---------------------------------------------------------
        // Check whether a completed booking
        // has already been reviewed.
        // ---------------------------------------------------------

        if (
          data.status.toUpperCase() ===
          "COMPLETED"
        ) {
          try {
            await getReviewForBooking(
              data.id
            );

            setHasReviewed(true);
          } catch {
            setHasReviewed(false);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  // =========================================================
  // CALCULATE NIGHTS
  // =========================================================

  const calculateNights = (
    checkIn: string,
    checkOut: string
  ) => {
    const start =
      new Date(checkIn);

    const end =
      new Date(checkOut);

    const difference =
      end.getTime() -
      start.getTime();

    return Math.max(
      1,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString: string
  ) => {
    return new Date(
      dateString
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyles = (
    status: string
  ) => {
    switch (
      status.toUpperCase()
    ) {
      case "CONFIRMED":
        return {
          className:
            "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };

      case "COMPLETED":
        return {
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle2,
        };

      case "CANCELLED":
        return {
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };

      case "REJECTED":
        return {
          className:
            "bg-[var(--color-coral-light)] text-[var(--color-coral)] border-[var(--color-coral)]/20",
          icon: XCircle,
        };

      case "AWAITING_PAYMENT":
        return {
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: CreditCard,
        };

      default:
        return {
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock3,
        };
    }
  };

  // =========================================================
  // PAYMENT
  // =========================================================

  const isAwaitingPayment =
    booking?.status.toUpperCase() ===
    "AWAITING_PAYMENT";

  const isPaymentRejected =
    isAwaitingPayment &&
    existingPayment?.status.toUpperCase() ===
      "FAILED";

  const showPaymentSection =
    isAwaitingPayment;

  const openBankTransfer = async () => {
    if (!booking) {
      return;
    }

    setPaymentMethod(
      "BANK_TRANSFER"
    );

    setBankDetailsError("");
    setReceiptError("");

    if (bankDetails) {
      return;
    }

    try {
      setLoadingBankDetails(true);

      const details =
        await getBankDetails(
          booking.id
        );

      setBankDetails(details);
    } catch (err) {
      setBankDetailsError(
        err instanceof Error
          ? err.message
          : "Failed to load bank details."
      );
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const handleReceiptFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    setReceiptError("");
    setReceiptSuccess(false);

    if (!file) {
      setReceiptFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setReceiptFile(null);

      setReceiptError(
        "Please upload a JPG, PNG, WEBP or PDF file."
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setReceiptFile(null);

      setReceiptError(
        "The receipt file must be smaller than 10 MB."
      );

      return;
    }

    setReceiptFile(file);
  };

  const handleBankTransferSubmit =
    async () => {
      if (!booking) {
        return;
      }

      setReceiptError("");
      setReceiptSuccess(false);

      if (
        !transferReference.trim()
      ) {
        setReceiptError(
          "Please enter your transfer reference."
        );

        return;
      }

      if (!receiptFile) {
        setReceiptError(
          "Please upload your payment receipt."
        );

        return;
      }

      try {
        setUploadingReceipt(true);

        const payment =
          await uploadBankTransferReceipt(
            booking.id,
            receiptFile,
            transferReference.trim()
          );

        setExistingPayment(payment);

        setWasRejected(false);

        setReceiptSuccess(true);

        setReceiptFile(null);
        setTransferReference("");

        try {
          const updatedBooking =
            await getBooking(
              booking.id
            );

          setBooking(
            updatedBooking
          );
        } catch {
          // Payment was already submitted successfully.
        }
      } catch (err) {
        setReceiptError(
          err instanceof Error
            ? err.message
            : "Failed to submit payment receipt."
        );
      } finally {
        setUploadingReceipt(false);
      }
    };

  const handlePayHere = async () => {
    if (!booking) {
      return;
    }

    setPayHereError("");

    try {
      setPayHereLoading(true);

      const checkout =
        await createPayHereCheckout(
          booking.id
        );

      const form =
        document.createElement(
          "form"
        );

      form.method = "POST";
      form.action =
        checkout.checkoutUrl;

      form.style.display = "none";

      const fields: Record<
        string,
        string
      > = {
        merchant_id:
          checkout.merchant_id,

        return_url:
          checkout.return_url,

        cancel_url:
          checkout.cancel_url,

        notify_url:
          checkout.notify_url,

        first_name:
          checkout.first_name,

        last_name:
          checkout.last_name,

        email:
          checkout.email,

        phone:
          checkout.phone,

        address:
          checkout.address,

        city:
          checkout.city,

        country:
          checkout.country,

        order_id:
          checkout.order_id,

        items:
          checkout.items,

        currency:
          checkout.currency,

        amount:
          checkout.amount,

        hash:
          checkout.hash,
      };

      Object.entries(
        fields
      ).forEach(
        ([name, value]) => {
          const input =
            document.createElement(
              "input"
            );

          input.type = "hidden";
          input.name = name;
          input.value = value;

          form.appendChild(input);
        }
      );

      document.body.appendChild(
        form
      );

      form.submit();
    } catch (err) {
      setPayHereError(
        err instanceof Error
          ? err.message
          : "Unable to start online payment."
      );

      setPayHereLoading(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const canCancel =
    booking &&
    (
      booking.status.toUpperCase() ===
        "PENDING" ||
      booking.status.toUpperCase() ===
        "CONFIRMED"
    );

const openCancelPopup = () => {
  if (!booking) {
    return;
  }

  setCancelError("");

  console.log("BOOKING WHEN CANCEL CLICKED:", booking);

  setBookingToCancel(
    booking
  );
};
  const closeCancelPopup = () => {
    if (!cancelling) {
      setBookingToCancel(null);
      setCancelError("");
    }
  };

  const confirmCancelBooking =
    async () => {
      if (!bookingToCancel) {
        return;
      }

      try {
        setCancelling(true);
        setCancelError("");

        const updatedBooking =
          await cancelBooking(
            bookingToCancel.id
          );

        setBooking(
          updatedBooking
        );

        setBookingToCancel(
          null
        );

        // Reload refund information after cancellation.
        try {
          const refundData =
            await getTravelerRefund(
              updatedBooking.id
            );

          setRefund(refundData);
        } catch {
          setRefund(null);
        }
      } catch (err) {
        setCancelError(
          err instanceof Error
            ? err.message
            : "Failed to cancel booking."
        );
      } finally {
        setCancelling(false);
      }
    };

  // =========================================================
  // REVIEW
  // =========================================================

  const openReviewPopup = () => {
    setSelectedRating(0);
    setReviewComment("");
    setReviewError("");
    setReviewBooking(true);
  };

  const closeReviewPopup = () => {
    if (!submittingReview) {
      setReviewBooking(false);
      setSelectedRating(0);
      setReviewComment("");
      setReviewError("");
    }
  };

  const submitReview =
    async () => {
      if (!booking) {
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
        reviewComment.trim()
          .length > 2000
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
          booking.id,
          booking.propertyId,
          selectedRating,
          reviewComment
        );

        setHasReviewed(true);
        setReviewBooking(false);
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
      <div className="min-h-screen bg-[var(--color-background)]">
        <TravelerNavbar />

        <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Loading booking details...
          </p>
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
        <TravelerNavbar />

        <main className="mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />

            <h1 className="text-xl font-semibold text-[var(--color-navy)]">
              Booking not found
            </h1>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {error ||
                "We could not find this booking."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/my-bookings"
                )
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Bookings
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const nights =
    calculateNights(
      booking.checkIn,
      booking.checkOut
    );

  const status =
    getStatusStyles(
      booking.status
    );

  const StatusIcon =
    status.icon;

  const isCompleted =
    booking.status.toUpperCase() ===
    "COMPLETED";

  // =========================================================
  // CANCEL POPUP DATA
  // =========================================================

  /*
   * A booking is considered paid when:
   *
   * 1. Its booking status is CONFIRMED, OR
   * 2. Its payment status is PAID.
   *
   * This matches the StayBy payment flow where a CONFIRMED
   * booking has already completed payment verification.
   */
const isPaidBooking =
  bookingToCancel?.status?.trim().toUpperCase() === "CONFIRMED" ||
  existingPayment?.status?.trim().toUpperCase() === "PAID";
console.log("CANCEL DEBUG:", {
  bookingToCancel,
  bookingStatus: bookingToCancel?.status,
  paymentStatus: existingPayment?.status,
  isPaidBooking,
});
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TravelerNavbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/my-bookings"
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </button>

        {/* HEADING */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-coral)]">
            Booking #{booking.id}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-navy)]">
                Booking Details
              </h1>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                View and manage your accommodation booking.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.className}`}
            >
              <StatusIcon className="h-4 w-4" />
              {booking.status}
            </div>
          </div>
        </div>

        {/* PAYMENT REQUIRED NOTICE */}

        {isAwaitingPayment && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-amber-800">
                  Payment required
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  Your booking has been approved by the owner.
                  Please complete the payment to confirm your stay.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED PAYMENT NOTICE */}

        {isPaymentRejected && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-red-800">
                  Payment receipt rejected
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  Your previous payment receipt was rejected by
                  the property owner. Please submit a corrected
                  receipt below.
                </p>

                {existingPayment?.rejectionReason && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Rejection reason
                    </p>

                    <p className="mt-1 text-sm text-[var(--color-text)]">
                      {existingPayment.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REFUND INFORMATION */}

        {refund && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCE9E4]">
                <CreditCard className="h-5 w-5 text-[#E76F51]" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#172B4D]">
                  Refund Information
                </h3>

                <p className="text-sm text-gray-500">
                  Details about your booking refund
                </p>
              </div>
            </div>

            {/* PENDING */}

            {refund.status === "PENDING" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />

                  <div>
                    <p className="font-semibold text-amber-800">
                      Refund pending
                    </p>

                    <p className="mt-1 text-sm text-amber-700">
                      Your refund of Rs.{" "}
                      {refund.amount.toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}{" "}
                      is currently being processed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETED */}

            {refund.status === "COMPLETED" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

                  <div className="flex-1">
                    <p className="font-semibold text-green-800">
                      Refund completed
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Rs.{" "}
                      {refund.amount.toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}{" "}
                      has been marked as refunded.
                    </p>

                    {refund.refundReference && (
                      <p className="mt-2 text-sm text-green-700">
                        <span className="font-medium">
                          Refund reference:
                        </span>{" "}
                        {refund.refundReference}
                      </p>
                    )}

                    {refund.processedAt && (
                      <p className="mt-1 text-sm text-green-700">
                        <span className="font-medium">
                          Processed:
                        </span>{" "}
                        {new Date(
                          refund.processedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FAILED */}

            {refund.status === "FAILED" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />

                  <div>
                    <p className="font-semibold text-red-800">
                      Refund could not be completed
                    </p>

                    {refund.reason && (
                      <p className="mt-1 text-sm text-red-700">
                        {refund.reason}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-red-700">
                      Please contact the property owner for
                      further information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* LEFT */}

          <section className="space-y-6">

            {/* PROPERTY */}

            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                  Property
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[var(--color-navy)]">
                  {booking.propertyName}
                </h2>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Room
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {booking.roomName}
                  </p>
                </div>

                {(booking.address ||
                  booking.city) && (
                  <div className="mt-4 flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-coral)]" />

                    <div>
                      {booking.address && (
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {booking.address}
                        </p>
                      )}

                      {booking.city && (
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {booking.city}, Sri Lanka
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MAP */}

              {booking.latitude !==
                null &&
                booking.latitude !==
                  undefined &&
                booking.longitude !==
                  null &&
                booking.longitude !==
                  undefined ? (
                <div className="h-64 w-full border-t border-[var(--color-border)]">
                  <MapContainer
                    center={[
                      booking.latitude,
                      booking.longitude,
                    ]}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapCenterUpdater
                      position={[
                        booking.latitude,
                        booking.longitude,
                      ]}
                    />

                    <Marker
                      position={[
                        booking.latitude,
                        booking.longitude,
                      ]}
                    />
                  </MapContainer>
                </div>
              ) : (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-coral-light)] px-6 py-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-coral)]" />

                    <div>
                      <p className="text-sm font-semibold text-[var(--color-navy)]">
                        Location map unavailable
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        The property does not have a map location available yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT SECTION */}

            {showPaymentSection && (
              <div
                ref={paymentSectionRef}
                className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-coral-light)]">
                    <CreditCard className="h-5 w-5 text-[var(--color-coral)]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                      {isPaymentRejected
                        ? "Submit a new payment receipt"
                        : "Complete your payment"}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {isPaymentRejected
                        ? "Your previous receipt was rejected. Submit a corrected receipt for owner verification."
                        : `Pay LKR ${booking.totalPrice.toLocaleString()} to confirm your booking.`}
                    </p>
                  </div>
                </div>

                {/* PAYMENT OPTIONS */}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  {/* BANK TRANSFER */}

                  <button
                    type="button"
                    onClick={
                      openBankTransfer
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "BANK_TRANSFER"
                        ? "border-[var(--color-coral)] bg-[var(--color-coral-light)]"
                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-coral)]/50 hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-background)]">
                        <Building2 className="h-5 w-5 text-[var(--color-navy)]" />
                      </div>

                      {paymentMethod ===
                        "BANK_TRANSFER" && (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-coral)]" />
                      )}
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[var(--color-navy)]">
                      Bank Transfer
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {isPaymentRejected
                        ? "Upload a corrected payment receipt and transfer reference."
                        : "Transfer the amount to the owner's bank account and upload your receipt."}
                    </p>
                  </button>

                  {/* PAYHERE */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        "PAYHERE"
                      )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "PAYHERE"
                        ? "border-[var(--color-coral)] bg-[var(--color-coral-light)]"
                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-coral)]/50 hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-background)]">
                        <CreditCard className="h-5 w-5 text-[var(--color-navy)]" />
                      </div>

                      {paymentMethod ===
                        "PAYHERE" && (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-coral)]" />
                      )}
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[var(--color-navy)]">
                      Online Payment
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                      Continue to PayHere to make an online card payment.
                    </p>
                  </button>
                </div>

                {/* BANK TRANSFER PANEL */}

                {paymentMethod ===
                  "BANK_TRANSFER" && (
                  <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-[var(--color-coral)]" />

                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                          Bank transfer details
                        </h3>

                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          Transfer the exact booking amount and keep your receipt.
                        </p>
                      </div>
                    </div>

                    {loadingBankDetails && (
                      <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-text-secondary)]">
                        Loading bank details...
                      </div>
                    )}

                    {bankDetailsError && (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {bankDetailsError}
                      </div>
                    )}

                    {bankDetails && (
                      <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-white p-5">
                        <div className="grid gap-4 sm:grid-cols-2">

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                              Bank
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                              {bankDetails.bankName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                              Branch
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                              {bankDetails.branch}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                              Account name
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                              {bankDetails.accountName}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                              Account number
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                              {bankDetails.accountNumber}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                              Amount to transfer
                            </span>

                            <span className="text-lg font-bold text-[var(--color-navy)]">
                              LKR{" "}
                              {booking.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RECEIPT FORM */}

                    {bankDetails && (
                      <div className="mt-6 space-y-5">

                        {/* EXISTING SUBMITTED RECEIPT */}

                        {existingPayment?.receiptUrl &&
                        !replaceReceipt ? (
                          <div className="space-y-5">
                            <div
                              className={`rounded-2xl border p-5 ${
                                existingPayment.status ===
                                "FAILED"
                                  ? "border-red-200 bg-red-50"
                                  : "border-[var(--color-border)] bg-white"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {existingPayment.status ===
                                "FAILED" ? (
                                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                                ) : (
                                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                                )}

                                <div>
                                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                    {existingPayment.status ===
                                    "FAILED"
                                      ? "Payment rejected"
                                      : "Payment receipt submitted"}
                                  </h3>

                                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                    {existingPayment.status ===
                                    "FAILED"
                                      ? "Your payment receipt was not approved by the property owner. You can submit a corrected receipt."
                                      : "Your payment receipt has been submitted and is waiting for owner verification."}
                                  </p>
                                </div>
                              </div>

                              {existingPayment.transferReference && (
                                <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-white p-4">
                                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                                    Transfer reference
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                                    {existingPayment.transferReference}
                                  </p>
                                </div>
                              )}

                              {existingPayment.status ===
                                "FAILED" &&
                                existingPayment.rejectionReason && (
                                  <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                                    <div className="flex items-start gap-3">
                                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                      <div>
                                        <p className="text-sm font-semibold text-red-700">
                                          Rejection reason
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                                          {existingPayment.rejectionReason}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                  Payment status
                                </span>

                                {existingPayment.status ===
                                "FAILED" ? (
                                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                    Rejected
                                  </span>
                                ) : existingPayment.status ===
                                  "PAID" ? (
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                    Pending verification
                                  </span>
                                )}
                              </div>

                              <div className="mt-5">
                                <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                                  Submitted receipt
                                </p>

                                {existingPayment.receiptUrl
                                  ?.toLowerCase()
                                  .endsWith(
                                    ".pdf"
                                  ) ? (
                                  <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-gray-50 p-4">
                                    <FileText className="h-6 w-6 text-red-600" />

                                    <div>
                                      <p className="text-sm font-medium text-[var(--color-text)]">
                                        Payment receipt PDF
                                      </p>

                                      <a
                                        href={`${API_BASE_URL}${existingPayment.receiptUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-coral)] hover:underline"
                                      >
                                        Open submitted receipt
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-50">
                                    <img
                                      src={`${API_BASE_URL}${existingPayment.receiptUrl}`}
                                      alt="Submitted payment receipt"
                                      className="max-h-72 w-full object-contain"
                                    />

                                    <div className="border-t border-[var(--color-border)] p-3">
                                      <a
                                        href={`${API_BASE_URL}${existingPayment.receiptUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-coral)] hover:underline"
                                      >
                                        Open submitted receipt
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {existingPayment.status ===
                                "FAILED" && (
                                <div className="mt-5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplaceReceipt(
                                        true
                                      );
                                      setWasRejected(
                                        true
                                      );
                                      setReceiptSuccess(
                                        false
                                      );
                                      setReceiptError(
                                        ""
                                      );

                                      setTransferReference(
                                        existingPayment.transferReference ||
                                          ""
                                      );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Submit a new receipt
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                                {wasRejected
                                  ? "Submit a new payment receipt"
                                  : "Submit payment receipt"}
                              </h3>

                              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                                {wasRejected
                                  ? "Upload a corrected receipt and enter the new transfer reference for owner verification."
                                  : "Enter your transfer reference and upload the receipt for owner verification."}
                              </p>
                            </div>

                            <div>
                              <label
                                htmlFor="transfer-reference"
                                className="text-sm font-semibold text-[var(--color-text)]"
                              >
                                Transfer reference
                              </label>

                              <input
                                id="transfer-reference"
                                type="text"
                                value={
                                  transferReference
                                }
                                onChange={(e) => {
                                  setTransferReference(
                                    e.target.value
                                  );

                                  setReceiptError(
                                    ""
                                  );

                                  setReceiptSuccess(
                                    false
                                  );
                                }}
                                maxLength={100}
                                placeholder="Enter your bank transfer reference"
                                className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral-light)]"
                              />

                              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                                Use the reference shown on your bank transfer receipt.
                              </p>
                            </div>

                            <div>
                              <label
                                htmlFor="payment-receipt"
                                className="text-sm font-semibold text-[var(--color-text)]"
                              >
                                Payment receipt
                              </label>

                              <label
                                htmlFor="payment-receipt"
                                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-white px-5 py-8 text-center transition hover:border-[var(--color-coral)] hover:bg-[var(--color-coral-light)]"
                              >
                                <Upload className="h-7 w-7 text-[var(--color-coral)]" />

                                <p className="mt-3 text-sm font-semibold text-[var(--color-navy)]">
                                  {receiptFile
                                    ? receiptFile.name
                                    : "Upload your payment receipt"}
                                </p>

                                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                  JPG, PNG, WEBP or PDF · Maximum 10 MB
                                </p>

                                <input
                                  id="payment-receipt"
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                                  onChange={
                                    handleReceiptFileChange
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {receiptError && (
                              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {receiptError}
                              </div>
                            )}

                            {receiptSuccess && (
                              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                <div className="flex items-start gap-3">
                                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                                  <div>
                                    <p className="text-sm font-semibold text-green-700">
                                      New receipt submitted
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-green-700">
                                      Your updated receipt has been submitted. The property owner will review it.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={
                                handleBankTransferSubmit
                              }
                              disabled={
                                uploadingReceipt
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)] disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              <FileText className="h-4 w-4" />

                              {uploadingReceipt
                                ? "Submitting receipt..."
                                : wasRejected
                                  ? "Submit new receipt"
                                  : "Submit payment receipt"}
                            </button>

                            {existingPayment?.receiptUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplaceReceipt(
                                    false
                                  );

                                  setWasRejected(
                                    false
                                  );

                                  setReceiptFile(
                                    null
                                  );

                                  setTransferReference(
                                    ""
                                  );

                                  setReceiptError(
                                    ""
                                  );

                                  setReceiptSuccess(
                                    false
                                  );
                                }}
                                className="w-full text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
                              >
                                Cancel replacement
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PAYHERE PANEL */}

                {paymentMethod ===
                  "PAYHERE" && (
                  <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                        <CreditCard className="h-5 w-5 text-[var(--color-coral)]" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-[var(--color-navy)]">
                          Online payment with PayHere
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
                          You will be redirected to the PayHere checkout page to complete your payment.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Amount
                        </span>

                        <span className="text-lg font-bold text-[var(--color-navy)]">
                          LKR{" "}
                          {booking.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Payment provider
                        </span>

                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          PayHere
                        </span>
                      </div>
                    </div>

                    {payHereError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {payHereError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handlePayHere
                      }
                      disabled={
                        payHereLoading
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-5 py-3.5 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)] hover:text-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CreditCard className="h-4 w-4" />

                      {payHereLoading
                        ? "Starting PayHere..."
                        : "Pay securely with PayHere"}
                    </button>

                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                        <div>
                          <p className="text-sm font-semibold text-blue-700">
                            Online payment
                          </p>

                          <p className="mt-1 text-xs leading-5 text-blue-700">
                            You will be redirected to PayHere to complete your payment securely.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-center text-xs leading-5 text-[var(--color-text-secondary)]">
                      Your booking will only be confirmed after the payment is successfully verified.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STAY INFORMATION */}

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Stay Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <CalendarDays className="h-4 w-4" />
                    Check-in
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {formatDate(
                      booking.checkIn
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <CalendarDays className="h-4 w-4" />
                    Check-out
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {formatDate(
                      booking.checkOut
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <Users className="h-4 w-4" />
                    Guests
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {booking.guests}{" "}
                    {booking.guests ===
                    1
                      ? "Guest"
                      : "Guests"}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--color-background)] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <Clock3 className="h-4 w-4" />
                    Duration
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {nights}{" "}
                    {nights === 1
                      ? "Night"
                      : "Nights"}
                  </p>
                </div>
              </div>
            </div>

            {/* PURPOSE */}

            <div className="rounded-xl bg-[var(--color-background)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                Purpose of stay
              </p>

              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {booking.purpose ||
                  "Not specified"}
              </p>
            </div>

            {/* REJECTION REASON */}

            {booking.status.toUpperCase() ===
              "REJECTED" &&
              booking.rejectionReason && (
                <div className="rounded-2xl border border-[var(--color-coral)]/20 bg-[var(--color-coral-light)] p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                      <XCircle className="h-5 w-5 text-[var(--color-coral)]" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-[var(--color-coral)]">
                        Booking Rejected
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">
                        {booking.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* COMPLETED REVIEW */}

            {isCompleted && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                      Your Review
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      Share your experience with this property.
                    </p>
                  </div>

                  {hasReviewed ? (
                    <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Reviewed
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        openReviewPopup
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
                    >
                      <Star
                        className="h-4 w-4"
                        fill="currentColor"
                      />
                      Write a review
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT - SUMMARY */}

          <aside>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                Booking Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Room
                  </span>

                  <span className="text-right text-sm font-medium text-[var(--color-text)]">
                    {booking.roomName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Check-in
                  </span>

                  <span className="text-right text-sm font-medium text-[var(--color-text)]">
                    {booking.checkIn}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Check-out
                  </span>

                  <span className="text-right text-sm font-medium text-[var(--color-text)]">
                    {booking.checkOut}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Guests
                  </span>

                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {booking.guests}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Purpose
                  </span>

                  <span className="max-w-[180px] text-right text-sm font-medium text-[var(--color-text)]">
                    {booking.purpose ||
                      "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Nights
                  </span>

                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {nights}
                  </span>
                </div>

                <div className="border-t border-[var(--color-border)] pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-[var(--color-navy)]">
                      LKR{" "}
                      {booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOOKING ID */}

              <div className="mt-6 rounded-xl bg-[var(--color-background)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Booking ID
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                  #{booking.id}
                </p>
              </div>

              {/* PAYMENT BUTTON */}

              {showPaymentSection && (
                <button
                  type="button"
                  onClick={() => {
                    paymentSectionRef.current?.scrollIntoView(
                      {
                        behavior:
                          "smooth",
                        block: "start",
                      }
                    );

                    if (
                      isPaymentRejected
                    ) {
                      setPaymentMethod(
                        "BANK_TRANSFER"
                      );
                    }
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-coral)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]"
                >
                  <CreditCard className="h-4 w-4" />

                  {isPaymentRejected
                    ? "Submit new receipt"
                    : "Complete payment"}
                </button>
              )}

              {/* CANCEL */}

              {canCancel && (
                <button
                  type="button"
                  onClick={
                    openCancelPopup
                  }
                  className="mt-5 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* =========================================================
          CANCEL POPUP
      ========================================================= */}

      {bookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={
            closeCancelPopup
          }
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
            <button
              type="button"
              onClick={
                closeCancelPopup
              }
              disabled={
                cancelling
              }
              aria-label="Close cancellation popup"
              className="absolute right-5 top-5 text-red-500 transition hover:text-red-700 disabled:opacity-50"
            >
              <XCircle size={24} />
            </button>

            <h2
              id="cancel-booking-title"
              className="pr-10 text-xl font-semibold text-[var(--color-navy)]"
            >
              Cancel booking?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Are you sure you want to cancel your booking at{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {bookingToCancel.propertyName}
              </span>
              ?
            </p>

            {/* =====================================================
                REFUND NOTICE
            ===================================================== */}

           <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Refund will be requested
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      This booking has already been paid for.
                      If you cancel it, a refund request will
                      be created automatically. The property
                      owner will process the refund separately.
                    </p>
                  </div>
                </div>
          </div>
            <div className="mt-5 rounded-xl bg-[var(--color-background)] p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Room
                </span>

                <span className="text-right font-medium text-[var(--color-text)]">
                  {bookingToCancel.roomName}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  Dates
                </span>

                <span className="text-right font-medium text-[var(--color-text)]">
                  {bookingToCancel.checkIn}{" "}
                  →{" "}
                  {bookingToCancel.checkOut}
                </span>
              </div>
            </div>

            {cancelError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={
                  closeCancelPopup
                }
                disabled={
                  cancelling
                }
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-50"
              >
                Keep booking
              </button>

              <button
                type="button"
                onClick={
                  confirmCancelBooking
                }
                disabled={
                  cancelling
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          REVIEW POPUP
      ========================================================= */}

      {reviewBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={
            closeReviewPopup
          }
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
            <button
              type="button"
              onClick={
                closeReviewPopup
              }
              disabled={
                submittingReview
              }
              aria-label="Close review popup"
              className="absolute right-5 top-5 text-[var(--color-text-secondary)] transition hover:text-[var(--color-navy)] disabled:opacity-50"
            >
              <XCircle size={24} />
            </button>

            <h2
              id="review-booking-title"
              className="pr-10 text-xl font-semibold text-[var(--color-navy)]"
            >
              Write a review
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Share your experience at{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {booking.propertyName}
              </span>
              .
            </p>

            {/* RATING */}

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
                      className="rounded-lg p-1 transition hover:scale-105 disabled:opacity-60"
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
                    1 &&
                    "Poor"}

                  {selectedRating ===
                    2 &&
                    "Fair"}

                  {selectedRating ===
                    3 &&
                    "Good"}

                  {selectedRating ===
                    4 &&
                    "Very good"}

                  {selectedRating ===
                    5 &&
                    "Excellent"}
                </p>
              )}
            </div>

            {/* COMMENT */}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment"
                  className="text-sm font-semibold text-[var(--color-navy)]"
                >
                  Your review
                </label>

                <span className="text-xs text-[var(--color-text-secondary)]">
                  {reviewComment.length}/2000
                </span>
              </div>

              <textarea
                id="review-comment"
                value={
                  reviewComment
                }
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
                className="mt-2 w-full resize-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-gray-400 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/10 disabled:bg-gray-50"
              />
            </div>

            {reviewError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {reviewError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={
                  closeReviewPopup
                }
                disabled={
                  submittingReview
                }
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitReview
                }
                disabled={
                  submittingReview ||
                  selectedRating ===
                    0
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

export default BookingDetails;