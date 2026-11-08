import type { PayHereCheckoutResponse } from "./paymentService";

/*
 * Opens the PayHere payment pop-up on top of the current page,
 * using PayHere's official payhere.js library.
 *
 * The traveler never leaves StayBy. The result is still confirmed by
 * the backend (PayHere's server-to-server "notify" call), so the
 * handlers below only decide what the page does next.
 */

const PAYHERE_SCRIPT_URL =
  "https://www.payhere.lk/lib/payhere-2.0.js";

interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface PayHereGlobal {
  startPayment: (payment: PayHerePayment) => void;
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    payhere?: PayHereGlobal;
  }
}

export interface PayHerePopupHandlers {
  /** The pop-up finished. The result is NOT known yet. */
  onCompleted: (orderId: string) => void;
  /** The traveler closed the pop-up. */
  onDismissed: () => void;
  /** PayHere rejected the payment details. */
  onError: (message: string) => void;
}

let scriptPromise: Promise<void> | null = null;

function loadPayHereScript(): Promise<void> {
  if (window.payhere) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");

    script.src = PAYHERE_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () => {
      scriptPromise = null;
      script.remove();

      reject(
        new Error(
          "Could not load the PayHere payment window. Check your internet connection and try again."
        )
      );
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function startPayHerePopup(
  checkout: PayHereCheckoutResponse,
  handlers: PayHerePopupHandlers
): Promise<void> {
  await loadPayHereScript();

  const payhere = window.payhere;

  if (!payhere) {
    throw new Error("The PayHere payment window is not available.");
  }

  payhere.onCompleted = handlers.onCompleted;
  payhere.onDismissed = handlers.onDismissed;
  payhere.onError = (error: string) =>
    handlers.onError(
      error || "PayHere could not start this payment."
    );

  payhere.startPayment({
    // The backend already chose sandbox or live in checkoutUrl.
    sandbox: checkout.checkoutUrl.includes("sandbox.payhere.lk"),
    merchant_id: checkout.merchant_id,
    return_url: checkout.return_url,
    cancel_url: checkout.cancel_url,
    notify_url: checkout.notify_url,
    order_id: checkout.order_id,
    items: checkout.items,
    amount: checkout.amount,
    currency: checkout.currency,
    hash: checkout.hash,
    first_name: checkout.first_name,
    last_name: checkout.last_name,
    email: checkout.email,
    phone: checkout.phone,
    address: checkout.address,
    city: checkout.city,
    country: checkout.country,
  });
}