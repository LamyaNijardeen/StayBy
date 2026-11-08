package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.entity.Refund;
import com.stayby.backend.entity.RefundStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import com.stayby.backend.repository.RefundRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PayHereService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final RefundRepository refundRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    /*
     * Address of the React app. PayHere sends the traveler back
     * here after paying or cancelling. Change it when you deploy.
     */
    @Value("${stayby.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${payhere.sandbox:true}")
    private boolean sandbox;

    public PayHereService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            RefundRepository refundRepository,
            NotificationService notificationService,
            EmailService emailService
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.refundRepository = refundRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // =========================================================
    // CREATE CHECKOUT
    // =========================================================

    public Map<String, String> createCheckout(
            Long bookingId,
            Long userId
    ) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        // Only the traveler who made the booking can pay for it.
        if (booking.getUser() == null
                || !booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to pay for this booking"
            );
        }

        if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException(
                    "Payment can only be made when the booking is awaiting payment"
            );
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Payment record not found for this booking"
                        ));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException(
                    "This booking has already been paid"
            );
        }

        // A bank-transfer receipt is already waiting for the owner.
        // Starting a card payment now would overwrite it.
        if (payment.getStatus() == PaymentStatus.PENDING
                && "BANK_TRANSFER".equals(payment.getPaymentMethod())
                && payment.getReceiptUrl() != null
                && !payment.getReceiptUrl().isBlank()) {
            throw new IllegalArgumentException(
                    "Your bank-transfer receipt is waiting for the owner to verify it. "
                            + "Online payment is not available until it is approved or rejected."
            );
        }

        if (booking.getUser() == null) {
            throw new IllegalArgumentException(
                    "Booking customer information is missing"
            );
        }

        String orderId = payment.getOrderId();

        if (orderId == null || orderId.isBlank()) {
            orderId = "STAYBY-" + bookingId + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

            payment.setOrderId(orderId);
        }

        payment.setPaymentMethod("PAYHERE");
        payment.setAmount(booking.getTotalPrice());
        payment.setStatus(PaymentStatus.PENDING);

        paymentRepository.save(payment);

        String amount = BigDecimal.valueOf(booking.getTotalPrice())
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString();

        String currency = "LKR";

        String hash = generateHash(
                merchantId,
                orderId,
                amount,
                currency,
                merchantSecret
        );

        String checkoutUrl = sandbox
                ? "https://sandbox.payhere.lk/pay/checkout"
                : "https://www.payhere.lk/pay/checkout";

        Map<String, String> checkoutData = new LinkedHashMap<>();

        checkoutData.put("checkoutUrl", checkoutUrl);
        checkoutData.put("merchant_id", merchantId);
        // The traveler returns to a page that checks the booking status.
        // (PayHere adds no payment result to these URLs, so the page
        // reads the real result from our own database.)
        String baseUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;

        checkoutData.put(
                "return_url",
                baseUrl + "/payment/return?bookingId=" + bookingId
        );
        checkoutData.put(
                "cancel_url",
                baseUrl + "/payment/cancel?bookingId=" + bookingId
        );
        checkoutData.put("notify_url", notifyUrl);

        checkoutData.put(
                "first_name",
                booking.getUser().getName()
        );

        checkoutData.put(
                "last_name",
                "Customer"
        );

        checkoutData.put(
                "email",
                booking.getUser().getEmail()
        );

        checkoutData.put(
                "phone",
                "0000000000"
        );

        checkoutData.put(
                "address",
                "Sri Lanka"
        );

        checkoutData.put(
                "city",
                "Colombo"
        );

        checkoutData.put(
                "country",
                "Sri Lanka"
        );

        checkoutData.put(
                "order_id",
                orderId
        );

        checkoutData.put(
                "items",
                "StayBy Booking #" + bookingId
        );

        checkoutData.put(
                "currency",
                currency
        );

        checkoutData.put(
                "amount",
                amount
        );

        checkoutData.put(
                "hash",
                hash
        );

        return checkoutData;
    }

    // =========================================================
    // PAYHERE NOTIFICATION
    //
    // md5sig = MD5(
    //     merchant_id + order_id + payhere_amount +
    //     payhere_currency + status_code + MD5(merchant_secret)
    // )  (upper-case)
    // =========================================================

    @Transactional
    public void handleNotification(Map<String, String> params) {

        String notifiedMerchantId = params.get("merchant_id");
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String receivedSignature = params.get("md5sig");
        String payherePaymentId = params.get("payment_id");

        if (notifiedMerchantId == null
                || orderId == null
                || payhereAmount == null
                || payhereCurrency == null
                || statusCode == null
                || receivedSignature == null) {

            throw new IllegalArgumentException(
                    "Missing PayHere notification fields"
            );
        }

        if (!merchantId.equals(notifiedMerchantId)) {
            throw new IllegalArgumentException(
                    "Merchant ID mismatch"
            );
        }

        // ---------------------------------------------------------
        // Verify the signature
        // ---------------------------------------------------------

        String expectedSignature = md5(
                notifiedMerchantId
                        + orderId
                        + payhereAmount
                        + payhereCurrency
                        + statusCode
                        + md5(merchantSecret).toUpperCase()
        ).toUpperCase();

        boolean validSignature = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                receivedSignature.trim()
                        .toUpperCase()
                        .getBytes(StandardCharsets.UTF_8)
        );

        if (!validSignature) {
            throw new IllegalArgumentException(
                    "Invalid PayHere signature"
            );
        }

        // ---------------------------------------------------------
        // Only a successful payment (status_code 2) changes anything.
        // Pending (0), cancelled (-1), failed (-2) and charged-back (-3)
        // notifications are logged only. The traveler can simply try
        // again while the booking is still awaiting payment.
        // ---------------------------------------------------------

        if (!"2".equals(statusCode.trim())) {

            System.out.println(
                    "PayHere notification for order " + orderId
                            + " with status_code " + statusCode
                            + " (no action taken)"
            );

            return;
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Payment not found for order " + orderId
                        ));

        // PayHere may notify more than once. Handle only the first.
        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }

        // ---------------------------------------------------------
        // The paid amount and currency must match what we asked for
        // ---------------------------------------------------------

        BigDecimal expectedAmount = BigDecimal
                .valueOf(payment.getAmount())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal paidAmount;

        try {
            paidAmount = new BigDecimal(payhereAmount.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid PayHere amount"
            );
        }

        if (paidAmount.compareTo(expectedAmount) != 0
                || !"LKR".equalsIgnoreCase(payhereCurrency.trim())) {

            throw new IllegalArgumentException(
                    "Paid amount or currency does not match the booking"
            );
        }

        Booking booking = payment.getBooking();

        // ---------------------------------------------------------
        // Record the payment
        // ---------------------------------------------------------

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentMethod("PAYHERE");
        payment.setRejectionReason(null);

        if (payherePaymentId != null && !payherePaymentId.isBlank()) {
            payment.setPaymentId(payherePaymentId.trim());
        }

        paymentRepository.save(payment);

        // ---------------------------------------------------------
        // Normal case: booking is still waiting for this payment
        // ---------------------------------------------------------

        if (booking.getStatus() == BookingStatus.AWAITING_PAYMENT) {

            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setRejectionReason(null);

            Booking savedBooking = bookingRepository.save(booking);

            notificationService.createNotification(
                    savedBooking.getUser(),
                    "BOOKING_CONFIRMED",
                    "Booking confirmed",
                    "Your booking at "
                            + savedBooking.getRoom().getProperty().getName()
                            + " has been confirmed because your online payment was received. "
                            + "Room: "
                            + savedBooking.getRoom().getName()
                            + ". Check-in: "
                            + savedBooking.getCheckIn()
                            + ". Check-out: "
                            + savedBooking.getCheckOut()
                            + ".",
                    savedBooking.getId()
            );

            notificationService.createNotification(
                    savedBooking.getRoom().getProperty().getOwner(),
                    "PAYMENT_RECEIVED",
                    "Online payment received",
                    savedBooking.getUser().getName()
                            + " paid for booking #"
                            + savedBooking.getId()
                            + " by PayHere. The booking is now confirmed.",
                    savedBooking.getId()
            );

            try {
                emailService.sendBookingConfirmation(
                        savedBooking.getUser().getEmail(),
                        savedBooking.getUser().getName(),
                        savedBooking
                );
            } catch (Exception e) {
                // The payment is already recorded. A failed email must
                // never make PayHere think the notification failed.
                System.out.println(
                        "Could not send confirmation email: "
                                + e.getMessage()
                );
            }

            return;
        }

        // ---------------------------------------------------------
        // Edge case: the money arrived but the booking is no longer
        // awaiting payment (for example the traveler cancelled while
        // on the PayHere page). Do NOT confirm it. Create a refund
        // request so the owner returns the money.
        // ---------------------------------------------------------

        if (!refundRepository.existsByPaymentId(payment.getId())) {

            Refund refund = new Refund();

            refund.setPayment(payment);
            refund.setBooking(booking);
            refund.setAmount(payment.getAmount());
            refund.setStatus(RefundStatus.PENDING);
            refund.setReason(
                    "Payment was received after the booking was no longer awaiting payment"
            );

            refundRepository.save(refund);

            notificationService.createNotification(
                    booking.getRoom().getProperty().getOwner(),
                    "REFUND_REQUESTED",
                    "Refund requested",
                    "An online payment for booking #"
                            + booking.getId()
                            + " arrived after the booking was "
                            + booking.getStatus()
                            + ". A refund of "
                            + payment.getAmount()
                            + " is pending.",
                    booking.getId()
            );

            notificationService.createNotification(
                    booking.getUser(),
                    "REFUND_REQUESTED",
                    "Refund requested",
                    "Your payment for booking #"
                            + booking.getId()
                            + " arrived after the booking was "
                            + booking.getStatus()
                            + ". A refund of "
                            + payment.getAmount()
                            + " is pending processing.",
                    booking.getId()
            );
        }
    }

    private String generateHash(
            String merchantId,
            String orderId,
            String amount,
            String currency,
            String merchantSecret
    ) {

        String secretHash = md5(merchantSecret).toUpperCase();

        String hashString =
                merchantId
                        + orderId
                        + amount
                        + currency
                        + secretHash;

        return md5(hashString).toUpperCase();
    }

    private String md5(String value) {

        try {
            MessageDigest md = MessageDigest.getInstance("MD5");

            byte[] digest = md.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            StringBuilder result = new StringBuilder();

            for (byte b : digest) {
                result.append(
                        String.format("%02x", b)
                );
            }

            return result.toString();

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to generate PayHere hash",
                    e
            );
        }
    }
}