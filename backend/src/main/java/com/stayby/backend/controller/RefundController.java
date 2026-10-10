package com.stayby.backend.controller;

import com.stayby.backend.entity.Refund;
import com.stayby.backend.service.RefundService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(
            RefundService refundService
    ) {
        this.refundService = refundService;
    }

    // =========================================================
    // CREATE REFUND REQUEST
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<?> createRefund(
            @PathVariable Long bookingId,
            @RequestBody RefundRequest request,
            Authentication authentication
    ) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            Long ownerId = getOwnerId(authentication);

            Refund refund =
                    refundService.createRefund(
                            bookingId,
                            request.getReason(),
                            ownerId
                    );

            return ResponseEntity
                    .status(201)
                    .body(toResponse(refund));

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(401)
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

    // =========================================================
    // GET OWNER REFUNDS
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerRefunds(
            Authentication authentication
    ) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            Long ownerId = getOwnerId(authentication);

            return ResponseEntity.ok(
                    refundService
                            .getOwnerRefunds(ownerId)
                            .stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid authentication"
                            )
                    );
        }
    }

    // =========================================================
// GET TRAVELER REFUND FOR BOOKING
// =========================================================

@PreAuthorize("hasRole('TRAVELER')")
@GetMapping("/booking/{bookingId}")
public ResponseEntity<?> getTravelerRefund(
        @PathVariable Long bookingId,
        Authentication authentication
) {

    try {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Authentication required"
                            )
                    );
        }

        Long userId = Long.valueOf(
                authentication.getName()
        );

        Refund refund =
                refundService.getTravelerRefund(
                        bookingId,
                        userId
                );

        // No refund exists for this booking
        if (refund == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(
                toResponse(refund)
        );

    } catch (NumberFormatException e) {

        return ResponseEntity
                .status(401)
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

    // =========================================================
    // COMPLETE REFUND
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{refundId}/complete")
    public ResponseEntity<?> completeRefund(
            @PathVariable Long refundId,
            @RequestBody CompleteRefundRequest request,
            Authentication authentication
    ) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            Long ownerId = getOwnerId(authentication);

            Refund refund =
                    refundService.completeRefund(
                            refundId,
                            request.getRefundReference(),
                            ownerId
                    );

            return ResponseEntity.ok(
                    toResponse(refund)
            );

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(401)
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

    // =========================================================
    // FAIL REFUND
    // =========================================================

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{refundId}/fail")
    public ResponseEntity<?> failRefund(
            @PathVariable Long refundId,
            @RequestBody FailRefundRequest request,
            Authentication authentication
    ) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "message",
                                        "Authentication required"
                                )
                        );
            }

            Long ownerId = getOwnerId(authentication);

            Refund refund =
                    refundService.failRefund(
                            refundId,
                            request.getReason(),
                            ownerId
                    );

            return ResponseEntity.ok(
                    toResponse(refund)
            );

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(401)
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

    // =========================================================
    // GET OWNER ID
    // =========================================================

    private Long getOwnerId(
            Authentication authentication
    ) {

        return Long.valueOf(
                authentication.getName()
        );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    private Map<String, Object> toResponse(
            Refund refund
    ) {

        return Map.of(
                "id",
                refund.getId(),

                "bookingId",
                refund.getBooking().getId(),

                "paymentId",
                refund.getPayment().getId(),

                "amount",
                refund.getAmount(),

                "status",
                refund.getStatus(),

                "reason",
                refund.getReason(),

                "refundReference",
                refund.getRefundReference() == null
                        ? ""
                        : refund.getRefundReference(),

                "processedAt",
                refund.getProcessedAt() == null
                        ? ""
                        : refund.getProcessedAt(),

                "createdAt",
                refund.getCreatedAt()
        );
    }

    // =========================================================
    // REQUEST CLASSES
    // =========================================================

    public static class RefundRequest {

        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class CompleteRefundRequest {

        private String refundReference;

        public String getRefundReference() {
            return refundReference;
        }

        public void setRefundReference(
                String refundReference
        ) {
            this.refundReference = refundReference;
        }
    }

    public static class FailRefundRequest {

        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}