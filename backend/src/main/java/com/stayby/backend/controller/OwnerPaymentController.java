package com.stayby.backend.controller;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Role;
import com.stayby.backend.entity.User;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import com.stayby.backend.repository.UserRepository;
import com.stayby.backend.service.EmailService;
import com.stayby.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/payment")
public class OwnerPaymentController {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public OwnerPaymentController(
            UserRepository userRepository,
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            NotificationService notificationService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // =========================================================
    // GET OWNER BANK DETAILS
    // =========================================================

    @GetMapping("/bank-details")
    public ResponseEntity<?> getBankDetails(
            Authentication authentication
    ) {

        User owner = getAuthenticatedOwner(authentication);

        return ResponseEntity.ok(
                Map.of(
                        "bankName",
                        owner.getBankName() != null
                                ? owner.getBankName()
                                : "",

                        "accountName",
                        owner.getBankAccountName() != null
                                ? owner.getBankAccountName()
                                : "",

                        "accountNumber",
                        owner.getBankAccountNumber() != null
                                ? owner.getBankAccountNumber()
                                : "",

                        "branch",
                        owner.getBankBranch() != null
                                ? owner.getBankBranch()
                                : ""
                )
        );
    }

    // =========================================================
    // UPDATE OWNER BANK DETAILS
    // =========================================================

    @PutMapping("/bank-details")
    public ResponseEntity<?> updateBankDetails(
            Authentication authentication,
            @RequestBody BankDetailsRequest request
    ) {

        User owner = getAuthenticatedOwner(authentication);

        if (request.getBankName() == null
                || request.getBankName().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Bank name is required");
        }

        if (request.getAccountName() == null
                || request.getAccountName().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Account name is required");
        }

        if (request.getAccountNumber() == null
                || request.getAccountNumber().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Account number is required");
        }

        if (request.getBranch() == null
                || request.getBranch().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Bank branch is required");
        }

        owner.setBankName(request.getBankName().trim());
        owner.setBankAccountName(request.getAccountName().trim());
        owner.setBankAccountNumber(request.getAccountNumber().trim());
        owner.setBankBranch(request.getBranch().trim());

        userRepository.save(owner);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Bank details updated successfully"
                )
        );
    }

    // =========================================================
    // GET PENDING BANK TRANSFER PAYMENTS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingPayments(
            Authentication authentication
    ) {

        User owner = getAuthenticatedOwner(authentication);

        List<Payment> payments = paymentRepository.findAll()
                .stream()
                .filter(payment ->
                        payment.getStatus() == PaymentStatus.PENDING
                                && "BANK_TRANSFER".equals(
                                payment.getPaymentMethod()
                        )
                )
                .filter(payment -> {

                    Booking booking = payment.getBooking();

                    return booking != null
                            && booking.getRoom() != null
                            && booking.getRoom().getProperty() != null
                            && booking.getRoom().getProperty().getOwner() != null
                            && booking.getRoom()
                            .getProperty()
                            .getOwner()
                            .getId()
                            .equals(owner.getId());
                })
                .toList();

        List<Map<String, Object>> response = payments.stream()
                .map(payment -> {

                    Booking booking = payment.getBooking();

                    return Map.<String, Object>ofEntries(
                            Map.entry("paymentId", payment.getId()),
                            Map.entry("bookingId", booking.getId()),

                            Map.entry(
                                    "propertyName",
                                    booking.getRoom()
                                            .getProperty()
                                            .getName()
                            ),

                            Map.entry(
                                    "roomName",
                                    booking.getRoom()
                                            .getName()
                            ),

                            Map.entry(
                                    "travelerName",
                                    booking.getUser()
                                            .getName()
                            ),

                            Map.entry(
                                    "amount",
                                    payment.getAmount()
                            ),

                            Map.entry(
                                    "paymentMethod",
                                    payment.getPaymentMethod()
                            ),

                            Map.entry(
                                    "status",
                                    payment.getStatus()
                            ),

                            Map.entry(
                                    "transferReference",
                                    payment.getTransferReference()
                            ),

                            Map.entry(
                                    "receiptUrl",
                                    payment.getReceiptUrl()
                            ),

                            Map.entry(
                                    "receiptSubmittedAt",
                                    payment.getReceiptSubmittedAt()
                            ),

                            Map.entry(
                                    "checkIn",
                                    booking.getCheckIn()
                            ),

                            Map.entry(
                                    "checkOut",
                                    booking.getCheckOut()
                            )
                    );
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // APPROVE BANK TRANSFER PAYMENT
    // =========================================================

    @PutMapping("/{paymentId}/approve")
    public ResponseEntity<?> approvePayment(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {

        User owner = getAuthenticatedOwner(authentication);

        Payment payment = paymentRepository.findById(paymentId)
                .orElse(null);

        if (payment == null) {
            return ResponseEntity.status(404)
                    .body(
                            Map.of(
                                    "message",
                                    "Payment not found"
                            )
                    );
        }

        Booking booking = payment.getBooking();

        if (booking == null
                || booking.getRoom() == null
                || booking.getRoom().getProperty() == null
                || booking.getRoom().getProperty().getOwner() == null
                || !booking.getRoom()
                .getProperty()
                .getOwner()
                .getId()
                .equals(owner.getId())) {

            return ResponseEntity.status(403)
                    .body(
                            Map.of(
                                    "message",
                                    "You are not authorized to manage this payment"
                            )
                    );
        }

        if (!"BANK_TRANSFER".equals(payment.getPaymentMethod())) {
            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "This payment is not a bank transfer"
                            )
                    );
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Only pending payments can be approved"
                            )
                    );
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setRejectionReason(null);

        paymentRepository.save(payment);

        // Payment is complete, so the booking can now be confirmed
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setRejectionReason(null);

        Booking savedBooking = bookingRepository.save(booking);

        // ---------------------------------------------------------
        // SEND BOOKING CONFIRMATION EMAIL
        // ---------------------------------------------------------

        emailService.sendBookingConfirmation(
                savedBooking.getUser().getEmail(),
                savedBooking.getUser().getName(),
                savedBooking
        );

        // ---------------------------------------------------------
        // CREATE BOOKING CONFIRMATION NOTIFICATION
        // ---------------------------------------------------------

        String confirmationMessage =
                "Your booking at "
                        + savedBooking.getRoom().getProperty().getName()
                        + " has been confirmed because your payment was approved. "
                        + "Room: "
                        + savedBooking.getRoom().getName()
                        + ". Check-in: "
                        + savedBooking.getCheckIn()
                        + ". Check-out: "
                        + savedBooking.getCheckOut()
                        + ".";

        notificationService.createNotification(
                savedBooking.getUser(),
                "BOOKING_CONFIRMED",
                "Booking confirmed",
                confirmationMessage,
                savedBooking.getId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Payment approved and booking confirmed successfully",

                        "paymentId",
                        payment.getId(),

                        "bookingId",
                        savedBooking.getId(),

                        "paymentStatus",
                        payment.getStatus(),

                        "bookingStatus",
                        savedBooking.getStatus()
                )
        );
    }

    // =========================================================
    // REJECT BANK TRANSFER PAYMENT
    // =========================================================

    @PutMapping("/{paymentId}/reject")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Long paymentId,
            @RequestBody RejectPaymentRequest request,
            Authentication authentication
    ) {

        User owner = getAuthenticatedOwner(authentication);

        Payment payment = paymentRepository.findById(paymentId)
                .orElse(null);

        if (payment == null) {
            return ResponseEntity.status(404)
                    .body(
                            Map.of(
                                    "message",
                                    "Payment not found"
                            )
                    );
        }

        Booking booking = payment.getBooking();

        if (booking == null
                || booking.getRoom() == null
                || booking.getRoom().getProperty() == null
                || booking.getRoom().getProperty().getOwner() == null
                || !booking.getRoom()
                .getProperty()
                .getOwner()
                .getId()
                .equals(owner.getId())) {

            return ResponseEntity.status(403)
                    .body(
                            Map.of(
                                    "message",
                                    "You are not authorized to manage this payment"
                            )
                    );
        }

        if (!"BANK_TRANSFER".equals(payment.getPaymentMethod())) {
            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "This payment is not a bank transfer"
                            )
                    );
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Only pending payments can be rejected"
                            )
                    );
        }

        if (request.getReason() == null
                || request.getReason().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Rejection reason is required"
                            )
                    );
        }

        String reason = request.getReason().trim();

        if (reason.length() > 500) {
            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Rejection reason cannot exceed 500 characters"
                            )
                    );
        }

        // ---------------------------------------------------------
        // REJECT PAYMENT RECEIPT
        // ---------------------------------------------------------

        payment.setStatus(PaymentStatus.FAILED);
        payment.setRejectionReason(reason);

        paymentRepository.save(payment);

        // ---------------------------------------------------------
        // KEEP BOOKING AWAITING PAYMENT
        //
        // The booking remains active because the traveler can
        // submit a new payment receipt.
        // ---------------------------------------------------------

        booking.setStatus(BookingStatus.AWAITING_PAYMENT);
        booking.setRejectionReason(null);

        Booking savedBooking =
                bookingRepository.save(booking);

        // ---------------------------------------------------------
        // CREATE WEBSITE NOTIFICATION
        // ---------------------------------------------------------

        String rejectionMessage =
                "Your payment receipt for the booking at "
                        + savedBooking.getRoom().getProperty().getName()
                        + " was rejected. "
                        + "Please review the rejection reason and submit a new payment receipt. "
                        + "Reason: "
                        + reason;

        notificationService.createNotification(
                savedBooking.getUser(),
                "PAYMENT_REJECTED",
                "Payment receipt rejected",
                rejectionMessage,
                savedBooking.getId()
        );

        // ---------------------------------------------------------
        // SEND PAYMENT REJECTION EMAIL
        // ---------------------------------------------------------

        emailService.sendPaymentRejectionEmail(
                savedBooking.getUser().getEmail(),
                savedBooking.getUser().getName(),
                savedBooking,
                reason
        );

        // ---------------------------------------------------------
        // RESPONSE
        // ---------------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Payment receipt rejected successfully. Traveler can submit a new receipt.",

                        "paymentId",
                        payment.getId(),

                        "bookingId",
                        savedBooking.getId(),

                        "paymentStatus",
                        payment.getStatus(),

                        "bookingStatus",
                        savedBooking.getStatus(),

                        "rejectionReason",
                        reason
                )
        );
    }

    // =========================================================
    // AUTHENTICATED OWNER
    // =========================================================

    private User getAuthenticatedOwner(
            Authentication authentication
    ) {

        Long userId =
                Long.valueOf(authentication.getName());

        User owner = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account not found"
                        )
                );

        if (owner.getRole() != Role.OWNER) {
            throw new IllegalArgumentException(
                    "Only property owners can manage payment details"
            );
        }

        return owner;
    }

    // =========================================================
    // BANK DETAILS REQUEST DTO
    // =========================================================

    public static class BankDetailsRequest {

        private String bankName;
        private String accountName;
        private String accountNumber;
        private String branch;

        public String getBankName() {
            return bankName;
        }

        public void setBankName(String bankName) {
            this.bankName = bankName;
        }

        public String getAccountName() {
            return accountName;
        }

        public void setAccountName(String accountName) {
            this.accountName = accountName;
        }

        public String getAccountNumber() {
            return accountNumber;
        }

        public void setAccountNumber(String accountNumber) {
            this.accountNumber = accountNumber;
        }

        public String getBranch() {
            return branch;
        }

        public void setBranch(String branch) {
            this.branch = branch;
        }
    }

    // =========================================================
    // REJECT PAYMENT REQUEST DTO
    // =========================================================

    public static class RejectPaymentRequest {

        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}