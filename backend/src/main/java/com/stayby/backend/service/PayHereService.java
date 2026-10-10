package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    @Value("${payhere.return-url}")
    private String returnUrl;

    @Value("${payhere.cancel-url}")
    private String cancelUrl;

    @Value("${payhere.sandbox:true}")
    private boolean sandbox;

    public PayHereService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    public Map<String, String> createCheckout(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != com.stayby.backend.entity.BookingStatus.AWAITING_PAYMENT) {
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
        checkoutData.put("return_url", returnUrl);
        checkoutData.put("cancel_url", cancelUrl);
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