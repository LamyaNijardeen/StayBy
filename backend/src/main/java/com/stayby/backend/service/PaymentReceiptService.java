package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.BookingStatus;
import com.stayby.backend.entity.Payment;
import com.stayby.backend.entity.PaymentStatus;
import com.stayby.backend.repository.BookingRepository;
import com.stayby.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentReceiptService {

        private final PaymentRepository paymentRepository;
        private final BookingRepository bookingRepository;

        private final Path uploadDirectory = Paths.get("uploads/payment-receipts");

        public PaymentReceiptService(
                        PaymentRepository paymentRepository,
                        BookingRepository bookingRepository) {
                this.paymentRepository = paymentRepository;
                this.bookingRepository = bookingRepository;
        }

        // =========================================================
        // UPLOAD BANK TRANSFER RECEIPT
        // =========================================================

        public Payment uploadReceipt(
                        Long bookingId,
                        MultipartFile file,
                        String transferReference,
                        Long travelerId) throws IOException {

                // ---------------------------------------------------------
                // Find booking
                // ---------------------------------------------------------

                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

                // ---------------------------------------------------------
                // Check booking ownership
                // ---------------------------------------------------------

                if (!booking.getUser().getId().equals(travelerId)) {
                        throw new IllegalArgumentException(
                                        "You are not authorized to submit payment for this booking");
                }

                // ---------------------------------------------------------
                // Only confirmed bookings can be paid
                // ---------------------------------------------------------

                if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT) {
                        throw new IllegalArgumentException(
                                        "Payment can only be submitted when the booking is awaiting payment");
                }

                // ---------------------------------------------------------
                // Validate receipt file
                // ---------------------------------------------------------

                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Please select a payment receipt");
                }

                String contentType = file.getContentType();

                boolean validImage = "image/jpeg".equalsIgnoreCase(contentType)
                                || "image/png".equalsIgnoreCase(contentType)
                                || "image/webp".equalsIgnoreCase(contentType);

                boolean validPdf = "application/pdf".equalsIgnoreCase(contentType);

                if (!validImage && !validPdf) {
                        throw new IllegalArgumentException(
                                        "Only JPG, PNG, WEBP, or PDF receipts are allowed");
                }

                // ---------------------------------------------------------
                // Validate transfer reference
                // ---------------------------------------------------------

                if (transferReference == null ||
                                transferReference.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Transfer reference is required");
                }

                String cleanedReference = transferReference.trim();

                if (cleanedReference.length() > 100) {
                        throw new IllegalArgumentException(
                                        "Transfer reference cannot exceed 100 characters");
                }

                // ---------------------------------------------------------
                // Find existing payment
                // ---------------------------------------------------------

                Payment payment = paymentRepository
                                .findByBookingId(bookingId)
                                .orElse(null);

                // ---------------------------------------------------------
                // Create payment if one does not exist
                // ---------------------------------------------------------

                if (payment == null) {

                        payment = new Payment();

                        payment.setBooking(booking);
                        payment.setAmount(booking.getTotalPrice());
                        payment.setStatus(PaymentStatus.PENDING);
                        payment.setPaymentMethod("BANK_TRANSFER");
                }

                // ---------------------------------------------------------
                // Prevent another receipt after payment is already paid
                // ---------------------------------------------------------

                if (payment.getStatus() == PaymentStatus.PAID) {
                        throw new IllegalArgumentException(
                                        "This booking has already been paid");
                }

                // ---------------------------------------------------------
                // Create upload directory
                // ---------------------------------------------------------

                Files.createDirectories(uploadDirectory);

                // ---------------------------------------------------------
                // Get file extension
                // ---------------------------------------------------------

                String originalFilename = file.getOriginalFilename();

                String extension = "";

                if (originalFilename != null &&
                                originalFilename.contains(".")) {

                        extension = originalFilename.substring(
                                        originalFilename.lastIndexOf("."));
                }

                // ---------------------------------------------------------
                // Generate unique filename
                // ---------------------------------------------------------

                String filename = UUID.randomUUID() + extension;

                Path filePath = uploadDirectory.resolve(filename);

                // ---------------------------------------------------------
                // Save physical file
                // ---------------------------------------------------------

                Files.copy(
                                file.getInputStream(),
                                filePath);

                // ---------------------------------------------------------
                // Save payment information
                // ---------------------------------------------------------
                payment.setAmount(booking.getTotalPrice());
                payment.setPaymentMethod("BANK_TRANSFER");
                payment.setStatus(PaymentStatus.PENDING);

                // Clear the previous rejection when the traveler resubmits
                payment.setRejectionReason(null);

                payment.setReceiptUrl(
                                "/uploads/payment-receipts/" + filename);

                payment.setTransferReference(cleanedReference);

                payment.setReceiptSubmittedAt(LocalDateTime.now());

                return paymentRepository.save(payment);
        }
        // =========================================================
// GET PAYMENT FOR A BOOKING
// =========================================================

public Payment getPaymentForBooking(
        Long bookingId,
        Long travelerId) {

    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Booking not found"));

    // Check booking ownership
    if (!booking.getUser().getId().equals(travelerId)) {
        throw new IllegalArgumentException(
                "You are not authorized to view this payment");
    }

    return paymentRepository.findByBookingId(bookingId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Payment record not found for this booking"));
}
}