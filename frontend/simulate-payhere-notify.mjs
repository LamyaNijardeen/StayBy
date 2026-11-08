// Sends a FAKE (but correctly signed) PayHere "payment successful"
// notification to your own backend, so you can test the card flow on
// localhost without a public URL.
//
// DEVELOPMENT ONLY. It needs your merchant secret, so run it on your
// own computer and never commit the secret to git.
//
// Usage (Windows PowerShell):
//   $env:MERCHANT_SECRET="your-sandbox-secret"
//   node simulate-payhere-notify.mjs <merchant_id> <order_id> <amount>
//
// Usage (Mac / Linux):
//   MERCHANT_SECRET="your-sandbox-secret" node simulate-payhere-notify.mjs <merchant_id> <order_id> <amount>
//
// Example:
//   node simulate-payhere-notify.mjs 1234567 STAYBY-12-AB12CD34 15000.00
//
// order_id and amount are shown in the backend console / database
// (payments.order_id, payments.amount). The amount must have 2 decimals.

import { createHash } from "node:crypto";

const [merchantId, orderId, amount] = process.argv.slice(2);
const secret = process.env.MERCHANT_SECRET;
const backend = process.env.BACKEND_URL || "http://localhost:8080";

if (!merchantId || !orderId || !amount || !secret) {
  console.log(
    "Usage: MERCHANT_SECRET=... node simulate-payhere-notify.mjs <merchant_id> <order_id> <amount>"
  );
  process.exit(1);
}

const md5 = (value) =>
  createHash("md5").update(value).digest("hex").toUpperCase();

const currency = "LKR";
const statusCode = "2"; // 2 = success

const md5sig = md5(
  merchantId + orderId + amount + currency + statusCode + md5(secret)
);

const body = new URLSearchParams({
  merchant_id: merchantId,
  order_id: orderId,
  payment_id: "SIM" + Date.now(),
  payhere_amount: amount,
  payhere_currency: currency,
  status_code: statusCode,
  md5sig,
  method: "VISA",
  status_message: "Successfully completed the payment.",
});

const response = await fetch(`${backend}/api/payments/payhere/notify`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});

console.log("Backend answered:", response.status, await response.text());
