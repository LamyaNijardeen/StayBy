package com.stayby.backend.controller;

import com.stayby.backend.entity.Payment;
import com.stayby.backend.service.PaymentReceiptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentReceiptController {

    private final PaymentReceiptService paymentReceiptService;

    public PaymentReceiptController(
            PaymentReceiptService paymentReceiptService
    ) {
        this.paymentReceiptService = paymentReceiptService;
    }

    // =========================================================
    // UPLOAD / RESUBMIT BANK TRANSFER RECEIPT
    // =========================================================
    @PostMapping("/booking/{bookingId}/bank-transfer")
    public ResponseEntity<?> uploadReceipt(
            @PathVariable Long bookingId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("transferReference") String transferReference,
            Authentication authentication
    ) {
        try {
            Long travelerId = Long.valueOf(authentication.getName());

            Payment payment =
                    paymentReceiptService.uploadReceipt(
                            bookingId,
                            file,
                            transferReference,
                            travelerId
                    );

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "message",
                    "Bank transfer receipt submitted successfully"
            );

            response.put("paymentId", payment.getId());
            response.put("bookingId", payment.getBooking().getId());
            response.put("amount", payment.getAmount());
            response.put("status", payment.getStatus());
            response.put("paymentMethod", payment.getPaymentMethod());
            response.put("receiptUrl", payment.getReceiptUrl());
            response.put(
                    "transferReference",
                    payment.getTransferReference()
            );
            response.put(
                    "receiptSubmittedAt",
                    payment.getReceiptSubmittedAt()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid authentication"
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to upload payment receipt"
                            )
                    );
        }
    }

    // =========================================================
    // GET PAYMENT FOR A BOOKING
    // =========================================================
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentForBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {

        try {
            Long travelerId = Long.valueOf(
                    authentication.getName()
            );

            Payment payment =
                    paymentReceiptService.getPaymentForBooking(
                            bookingId,
                            travelerId
                    );

            /*
             * Do NOT use Map.of() here.
             *
             * Some payment fields can legitimately be null,
             * especially rejectionReason, receiptUrl, etc.
             *
             * HashMap allows null values.
             */
            Map<String, Object> response = new HashMap<>();

            response.put("id", payment.getId());
            response.put(
                    "bookingId",
                    payment.getBooking().getId()
            );
            response.put("amount", payment.getAmount());
            response.put("status", payment.getStatus());
            response.put(
                    "paymentMethod",
                    payment.getPaymentMethod()
            );
            response.put(
                    "receiptUrl",
                    payment.getReceiptUrl()
            );
            response.put(
                    "transferReference",
                    payment.getTransferReference()
            );
            response.put(
                    "rejectionReason",
                    payment.getRejectionReason()
            );
            response.put(
                    "receiptSubmittedAt",
                    payment.getReceiptSubmittedAt()
            );

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid authentication"
                            )
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}