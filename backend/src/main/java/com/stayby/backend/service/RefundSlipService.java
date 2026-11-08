package com.stayby.backend.service;

import com.stayby.backend.entity.Booking;
import com.stayby.backend.entity.Refund;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class RefundSlipService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern(
                    "dd MMM yyyy, hh:mm a"
            );

    public byte[] generateRefundSlip(Refund refund) {

        Booking booking = refund.getBooking();

        String propertyName =
                booking.getRoom()
                        .getProperty()
                        .getName();

        String roomName =
                booking.getRoom()
                        .getName();

        String travelerName =
                booking.getUser()
                        .getName();

        String travelerEmail =
                booking.getUser()
                        .getEmail();

        String bookingId =
                String.valueOf(booking.getId());

        String refundId =
                String.valueOf(refund.getId());

        String refundReference =
                refund.getRefundReference() != null
                        ? refund.getRefundReference()
                        : "-";

        String processedAt =
                refund.getProcessedAt() != null
                        ? refund.getProcessedAt()
                        .format(DATE_FORMAT)
                        : "-";

        String createdAt =
                refund.getCreatedAt() != null
                        ? refund.getCreatedAt()
                        .format(DATE_FORMAT)
                        : "-";

        String paymentMethod =
                refund.getPayment() != null
                        ? refund.getPayment().getPaymentMethod()
                        : null;

        String refundMethod =
                "PAYHERE".equalsIgnoreCase(paymentMethod)
                        ? "Card (PayHere)"
                        : "Bank Transfer";

        String amount =
                String.format(
                        "Rs. %,.2f",
                        refund.getAmount()
                );

        try (
                PDDocument document =
                        new PDDocument()
        ) {

            PDPage page =
                    new PDPage();

            document.addPage(page);

            try (
                    PDPageContentStream content =
                            new PDPageContentStream(
                                    document,
                                    page
                            )
            ) {

                PDType1Font boldFont =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD
                        );

                PDType1Font normalFont =
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA
                        );

                float y = 750;

                // =====================================================
                // HEADER
                // =====================================================

                content.beginText();
                content.setFont(
                        boldFont,
                        24
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText("StayBy");
                content.endText();

                y -= 35;

                content.beginText();
                content.setFont(
                        boldFont,
                        18
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText(
                        "Refund Confirmation"
                );
                content.endText();

                y -= 40;

                // =====================================================
                // INTRODUCTION
                // =====================================================

                content.beginText();
                content.setFont(
                        normalFont,
                        11
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText(
                        "This document confirms that the refund"
                );
                content.newLineAtOffset(
                        0,
                        -16
                );
                content.showText(
                        "for the following StayBy booking has been completed."
                );
                content.endText();

                y -= 55;

                // =====================================================
                // REFUND DETAILS
                // =====================================================

                content.beginText();
                content.setFont(
                        boldFont,
                        13
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText(
                        "Refund Details"
                );
                content.endText();

                y -= 25;

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Refund ID",
                        refundId,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Booking ID",
                        bookingId,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Traveler",
                        travelerName,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Email",
                        travelerEmail,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Property",
                        propertyName,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Room",
                        roomName,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Refund Amount",
                        amount,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Refund Method",
                        refundMethod,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Refund Reference",
                        refundReference,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Requested",
                        createdAt,
                        y
                );

                y = writeRow(
                        content,
                        normalFont,
                        boldFont,
                        "Processed",
                        processedAt,
                        y
                );

                y -= 20;

                // =====================================================
                // STATUS
                // =====================================================

                content.beginText();
                content.setFont(
                        boldFont,
                        13
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText(
                        "Status: REFUNDED"
                );
                content.endText();

                y -= 35;

                content.beginText();
                content.setFont(
                        normalFont,
                        10
                );
                content.newLineAtOffset(
                        60,
                        y
                );
                content.showText(
                        "This refund slip was generated by StayBy."
                );
                content.newLineAtOffset(
                        0,
                        -15
                );
                content.showText(
                        "Please keep this document for your records."
                );
                content.endText();
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            document.save(output);

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate refund slip",
                    e
            );
        }
    }

    private float writeRow(
            PDPageContentStream content,
            PDType1Font normalFont,
            PDType1Font boldFont,
            String label,
            String value,
            float y
    ) throws Exception {

        content.beginText();

        content.setFont(
                boldFont,
                10
        );

        content.newLineAtOffset(
                60,
                y
        );

        content.showText(
                label + ":"
        );

        content.setFont(
                normalFont,
                10
        );

        content.newLineAtOffset(
                150,
                0
        );

        content.showText(
                sanitize(value)
        );

        content.endText();

        return y - 19;
    }

    private String sanitize(String value) {

        if (value == null || value.isBlank()) {
            return "-";
        }

        return value
                .replace("\n", " ")
                .replace("\r", " ");
    }
}