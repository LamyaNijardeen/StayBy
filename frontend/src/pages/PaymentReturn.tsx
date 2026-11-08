import {
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import TravelerNavbar from "../components/TravelerNavbar";

import {
  getBooking,
  type BookingResponse,
} from "../services/bookingService";

/*
 * Where PayHere sends the traveler after the card payment page.
 *
 *   /payment/return?bookingId=12   -> traveler finished the PayHere page
 *   /payment/cancel?bookingId=12   -> traveler pressed "Cancel" on PayHere
 *
 * IMPORTANT: PayHere does NOT tell this page whether the payment worked.
 * The real result arrives at the backend through the server-to-server
 * "notify" call, which confirms the booking. So this page asks our own
 * backend for the booking status every few seconds until it changes.
 */

const CHECK_INTERVAL_MS = 3000;
const MAX_CHECKS = 20; // 20 x 3 seconds = about one minute

type Phase =
  | "checking"
  | "confirmed"
  | "cancelled"
  | "timeout"
  | "other"
  | "error";

function PaymentReturn() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isCancelPage =
    location.pathname.endsWith("/cancel");

  const bookingIdParam = searchParams.get("bookingId");
  const parsedId = Number(bookingIdParam);

  const bookingId =
    bookingIdParam && !Number.isNaN(parsedId)
      ? parsedId
      : null;

  const [phase, setPhase] = useState<Phase>("checking");
  const [booking, setBooking] =
    useState<BookingResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (bookingId === null) {
      return;
    }

    let stopped = false;
    let attempts = 0;
    let timer: number | undefined;

    const checkBooking = async () => {
      try {
        const data = await getBooking(bookingId);

        if (stopped) {
          return;
        }

        setBooking(data);

        const status = data.status.toUpperCase();

        // The notify call already confirmed the booking.
        if (status === "CONFIRMED" || status === "COMPLETED") {
          setPhase("confirmed");
          return;
        }

        if (status === "AWAITING_PAYMENT") {
          // Traveler pressed Cancel on the PayHere page.
          if (isCancelPage) {
            setPhase("cancelled");
            return;
          }

          // Waiting for PayHere to notify our backend.
          attempts += 1;

          if (attempts >= MAX_CHECKS) {
            setPhase("timeout");
            return;
          }

          timer = window.setTimeout(
            checkBooking,
            CHECK_INTERVAL_MS
          );
          return;
        }

        setPhase("other");
      } catch (err) {
        if (stopped) {
          return;
        }

        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to check your booking."
        );
        setPhase("error");
      }
    };

    checkBooking();

    return () => {
      stopped = true;

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [bookingId, isCancelPage, retryKey]);

  const checkAgain = () => {
    setPhase("checking");
    setRetryKey((current) => current + 1);
  };

  const bookingLink =
    bookingId !== null
      ? `/my-bookings/${bookingId}`
      : "/my-bookings";

  const primaryButton =
    "inline-flex items-center justify-center rounded-xl bg-[var(--color-coral)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-navy)]";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:border-[var(--color-coral)]";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TravelerNavbar />

      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
          {/* Invalid link */}
          {bookingId === null && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Booking not found
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                This payment link is not valid.
              </p>

              <div className="mt-6">
                <Link to="/my-bookings" className={primaryButton}>
                  Go to my bookings
                </Link>
              </div>
            </>
          )}

          {/* Checking */}
          {bookingId !== null && phase === "checking" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--color-coral)]" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Confirming your payment
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Please wait while we verify your payment with
                PayHere. Do not close or refresh this page.
              </p>
            </>
          )}

          {/* Confirmed */}
          {bookingId !== null && phase === "confirmed" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Payment successful
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Your booking
                {booking ? ` at ${booking.propertyName}` : ""} is
                confirmed. A confirmation email is on its way.
              </p>

              <div className="mt-6">
                <Link to={bookingLink} className={primaryButton}>
                  View booking
                </Link>
              </div>
            </>
          )}

          {/* Cancelled on the PayHere page */}
          {bookingId !== null && phase === "cancelled" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-amber-500" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Payment cancelled
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                You were not charged. Your booking is still waiting
                for payment, so you can try again.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={bookingLink} className={primaryButton}>
                  Try payment again
                </Link>

                <Link to="/my-bookings" className={secondaryButton}>
                  My bookings
                </Link>
              </div>
            </>
          )}

          {/* Still waiting after about a minute */}
          {bookingId !== null && phase === "timeout" && (
            <>
              <Clock3 className="mx-auto h-12 w-12 text-amber-500" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Still waiting for confirmation
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                We have not received the payment result yet. This
                can take a little longer. If your card was charged,
                your booking will be confirmed automatically.
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={checkAgain}
                  className={primaryButton}
                >
                  Check again
                </button>

                <Link to={bookingLink} className={secondaryButton}>
                  View booking
                </Link>
              </div>
            </>
          )}

          {/* Booking is in some other state */}
          {bookingId !== null && phase === "other" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Booking not confirmed
              </h1>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                This booking is currently{" "}
                <strong>
                  {booking?.status
                    .replace(/_/g, " ")
                    .toLowerCase()}
                </strong>
                . Open the booking to see the details.
              </p>

              <div className="mt-6">
                <Link to={bookingLink} className={primaryButton}>
                  View booking
                </Link>
              </div>
            </>
          )}

          {/* Error */}
          {bookingId !== null && phase === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />

              <h1 className="mt-5 text-2xl font-bold text-[var(--color-navy)]">
                Something went wrong
              </h1>

              <p className="mt-2 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={checkAgain}
                  className={primaryButton}
                >
                  Try again
                </button>

                <Link to="/login" className={secondaryButton}>
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaymentReturn;