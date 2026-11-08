package com.stayby.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.stayby.backend.entity.Refund;
import org.springframework.core.io.ByteArrayResource;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

import com.stayby.backend.entity.Booking;

@Service
public class EmailService {

        private final JavaMailSender mailSender;

        public EmailService(JavaMailSender mailSender) {
                this.mailSender = mailSender;
        }

        public void sendVerificationCode(
                        String recipientEmail,
                        String recipientName,
                        String verificationCode) {

                SimpleMailMessage message = new SimpleMailMessage();

                message.setTo(recipientEmail);
                message.setSubject("StayBy - Verify your email");

                message.setText(
                                "Hello " + recipientName + ",\n\n"
                                                + "Welcome to StayBy!\n\n"
                                                + "Your email verification code is:\n\n"
                                                + verificationCode
                                                + "\n\n"
                                                + "This code will expire in 10 minutes.\n\n"
                                                + "If you did not create a StayBy account, "
                                                + "you can safely ignore this email.\n\n"
                                                + "Regards,\n"
                                                + "StayBy Team");

                mailSender.send(message);
        }

        // =========================================================
        // PASSWORD RESET CODE EMAIL
        // =========================================================
        public void sendPasswordResetCode(
                        String recipientEmail,
                        String recipientName,
                        String resetCode) {

                SimpleMailMessage message = new SimpleMailMessage();

                message.setTo(recipientEmail);
                message.setSubject("StayBy - Reset your password");

                message.setText(
                                "Hello " + recipientName + ",\n\n"
                                                + "We received a request to reset your StayBy password.\n\n"
                                                + "Your password reset code is:\n\n"
                                                + resetCode
                                                + "\n\n"
                                                + "This code will expire in 10 minutes.\n\n"
                                                + "If you did not ask for this, you can safely ignore "
                                                + "this email. Your password will not change.\n\n"
                                                + "Regards,\n"
                                                + "StayBy Team");

                mailSender.send(message);
        }

        // =========================================================
        // BOOKING CONFIRMATION EMAIL
        // =========================================================
        public void sendBookingConfirmation(
                        String recipientEmail,
                        String recipientName,
                        Booking booking) {

                String propertyName = booking.getRoom().getProperty().getName();

                String roomName = booking.getRoom().getName();
                String ownerPhone = booking.getRoom()
                                .getProperty()
                                .getOwner()
                                .getPhone();

                String address = booking.getRoom().getProperty().getAddress();

                String city = booking.getRoom().getProperty().getCity();

                String purpose = booking.getPurpose();

                Double latitude = booking.getRoom().getProperty().getLatitude();

                Double longitude = booking.getRoom().getProperty().getLongitude();

                String mapsUrl = null;

                if (latitude != null && longitude != null) {
                        mapsUrl = "https://www.google.com/maps/dir/?api=1"
                                        + "&destination="
                                        + latitude
                                        + ","
                                        + longitude;
                }

                try {

                        MimeMessage message = mailSender.createMimeMessage();

                        MimeMessageHelper helper = new MimeMessageHelper(
                                        message,
                                        false,
                                        "UTF-8");

                        helper.setTo(recipientEmail);

                        helper.setSubject(
                                        "StayBy - Booking Confirmed");

                        String mapsSection = "";

                        if (mapsUrl != null) {

                                mapsSection = "<p style=\"margin-top:20px;\">"
                                                + "<a href=\"" + mapsUrl + "\" "
                                                + "style=\"display:inline-block;"
                                                + "background-color:#E76F51;"
                                                + "color:white;"
                                                + "text-decoration:none;"
                                                + "padding:10px 18px;"
                                                + "border-radius:6px;"
                                                + "font-weight:600;\">"
                                                + "Get directions in Google Maps"
                                                + "</a>"
                                                + "</p>";
                        }

                        String htmlContent = "<div style=\"font-family:Arial,sans-serif;"
                                        + "color:#333;max-width:600px;margin:auto;\">"

                                        + "<h2 style=\"color:#172B4D;\">"
                                        + "Booking Confirmed"
                                        + "</h2>"

                                        + "<p>Hello " + recipientName + ",</p>"

                                        + "<p>"
                                        + "Your booking has been confirmed!"
                                        + "</p>"

                                        + "<h3 style=\"color:#172B4D;\">"
                                        + "Booking Details"
                                        + "</h3>"

                                        + "<table style=\"width:100%;"
                                        + "border-collapse:collapse;\">"

                                        + "<tr><td><strong>Booking ID</strong></td>"
                                        + "<td>" + booking.getId() + "</td></tr>"

                                        + "<tr><td><strong>Property</strong></td>"
                                        + "<td>" + propertyName + "</td></tr>"

                                        + "<tr><td><strong>Room</strong></td>"
                                        + "<td>" + roomName + "</td></tr>"

                                        + "<tr><td><strong>Owner Phone</strong></td>"
                                        + "<td>"
                                        + (ownerPhone != null && !ownerPhone.isBlank()
                                                        ? ownerPhone
                                                        : "Not provided")
                                        + "</td></tr>"

                                        + "<tr><td><strong>Check-in</strong></td>"
                                        + "<td>" + booking.getCheckIn() + "</td></tr>"

                                        + "<tr><td><strong>Check-out</strong></td>"
                                        + "<td>" + booking.getCheckOut() + "</td></tr>"

                                        + "<tr><td><strong>Guests</strong></td>"
                                        + "<td>" + booking.getGuests() + "</td></tr>"

                                        + "<tr><td><strong>Purpose</strong></td>"
                                        + "<td>" + purpose + "</td></tr>"

                                        + "<tr><td><strong>Total</strong></td>"
                                        + "<td>" + booking.getTotalPrice() + "</td></tr>"

                                        + "</table>"

                                        + "<h3 style=\"color:#172B4D;"
                                        + "margin-top:25px;\">"
                                        + "Location"
                                        + "</h3>"

                                        + "<p>"
                                        + address + ", " + city
                                        + "</p>"

                                        + mapsSection

                                        + "<p style=\"margin-top:30px;\">"
                                        + "We look forward to welcoming you to StayBy."
                                        + "</p>"

                                        + "<p>"
                                        + "Regards,<br>"
                                        + "<strong>StayBy Team</strong>"
                                        + "</p>"

                                        + "</div>";

                        helper.setText(htmlContent, true);

                        mailSender.send(message);

                } catch (MessagingException e) {

                        throw new RuntimeException(
                                        "Failed to send booking confirmation email",
                                        e);
                }
        }

        // =========================================================
        // PAYMENT RECEIPT REJECTION EMAIL
        // =========================================================
        public void sendPaymentRejectionEmail(
                        String recipientEmail,
                        String recipientName,
                        Booking booking,
                        String rejectionReason) {

                String propertyName = booking.getRoom()
                                .getProperty()
                                .getName();

                String roomName = booking.getRoom()
                                .getName();

                try {

                        MimeMessage message = mailSender.createMimeMessage();

                        MimeMessageHelper helper = new MimeMessageHelper(
                                        message,
                                        false,
                                        "UTF-8");

                        helper.setTo(recipientEmail);

                        helper.setSubject(
                                        "StayBy - Payment Receipt Rejected");

                        String htmlContent = "<div style=\"font-family:Arial,sans-serif;"
                                        + "color:#333;"
                                        + "max-width:600px;"
                                        + "margin:auto;\">"

                                        + "<h2 style=\"color:#172B4D;\">"
                                        + "Payment Receipt Rejected"
                                        + "</h2>"

                                        + "<p>Hello " + recipientName + ",</p>"

                                        + "<p>"
                                        + "Your payment receipt for your StayBy booking "
                                        + "has been rejected by the property owner."
                                        + "</p>"

                                        + "<div style=\"background-color:#FCE9E4;"
                                        + "border-left:4px solid #E76F51;"
                                        + "padding:15px;"
                                        + "margin:20px 0;\">"

                                        + "<p style=\"margin:0 0 8px 0;\">"
                                        + "<strong>Reason for rejection:</strong>"
                                        + "</p>"

                                        + "<p style=\"margin:0;\">"
                                        + rejectionReason
                                        + "</p>"

                                        + "</div>"

                                        + "<h3 style=\"color:#172B4D;\">"
                                        + "Booking Details"
                                        + "</h3>"

                                        + "<table style=\"width:100%;"
                                        + "border-collapse:collapse;\">"

                                        + "<tr>"
                                        + "<td><strong>Booking ID</strong></td>"
                                        + "<td>" + booking.getId() + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Property</strong></td>"
                                        + "<td>" + propertyName + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Room</strong></td>"
                                        + "<td>" + roomName + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Check-in</strong></td>"
                                        + "<td>" + booking.getCheckIn() + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Check-out</strong></td>"
                                        + "<td>" + booking.getCheckOut() + "</td>"
                                        + "</tr>"

                                        + "</table>"

                                        + "<p style=\"margin-top:25px;\">"
                                        + "Your booking is still awaiting a valid payment."
                                        + " Please submit a new payment receipt "
                                        + "after reviewing the rejection reason."
                                        + "</p>"

                                        + "<p>"
                                        + "You can open your booking from your StayBy "
                                        + "account to submit a new receipt."
                                        + "</p>"

                                        + "<p style=\"margin-top:30px;\">"
                                        + "Regards,<br>"
                                        + "<strong>StayBy Team</strong>"
                                        + "</p>"

                                        + "</div>";

                        helper.setText(htmlContent, true);

                        mailSender.send(message);

                } catch (MessagingException e) {

                        throw new RuntimeException(
                                        "Failed to send payment rejection email",
                                        e);
                }
        }

        // =========================================================
        // REFUND COMPLETION EMAIL
        // =========================================================
        public void sendRefundCompletedEmail(
                        String recipientEmail,
                        String recipientName,
                        Refund refund,
                        byte[] refundSlip) {

                String propertyName = refund.getBooking()
                                .getRoom()
                                .getProperty()
                                .getName();

                String roomName = refund.getBooking()
                                .getRoom()
                                .getName();

                // Card (PayHere) or Bank Transfer
                String refundMethod = refund.getPayment() != null
                                && "PAYHERE".equalsIgnoreCase(
                                                refund.getPayment().getPaymentMethod())
                                                                ? "Card (PayHere)"
                                                                : "Bank Transfer";

                String refundReference = refund.getRefundReference() == null
                                || refund.getRefundReference().isBlank()
                                                ? "-"
                                                : refund.getRefundReference();

                String processedAt = refund.getProcessedAt() == null
                                ? "-"
                                : refund.getProcessedAt().format(
                                                java.time.format.DateTimeFormatter
                                                                .ofPattern("dd MMM yyyy, hh:mm a"));

                try {

                        MimeMessage message = mailSender.createMimeMessage();

                        MimeMessageHelper helper = new MimeMessageHelper(
                                        message,
                                        true,
                                        "UTF-8");

                        helper.setTo(recipientEmail);

                        helper.setSubject(
                                        "StayBy - Your Refund Has Been Completed");

                        String htmlContent = "<div style=\"font-family:Arial,sans-serif;"
                                        + "color:#333;"
                                        + "max-width:600px;"
                                        + "margin:auto;\">"

                                        + "<h2 style=\"color:#172B4D;\">"
                                        + "Refund Completed"
                                        + "</h2>"

                                        + "<p>Hello "
                                        + recipientName
                                        + ",</p>"

                                        + "<p>"
                                        + "Your refund for your StayBy booking "
                                        + "has been completed."
                                        + "</p>"

                                        + "<div style=\"background-color:#FCE9E4;"
                                        + "border-left:4px solid #E76F51;"
                                        + "padding:15px;"
                                        + "margin:20px 0;\">"

                                        + "<p style=\"margin:0;\">"
                                        + "<strong>Refund amount:</strong> Rs. "
                                        + String.format(
                                                        "%,.2f",
                                                        refund.getAmount())
                                        + "</p>"

                                        + "</div>"

                                        + "<h3 style=\"color:#172B4D;\">"
                                        + "Refund Details"
                                        + "</h3>"

                                        + "<table style=\"width:100%;"
                                        + "border-collapse:collapse;\">"

                                        + "<tr>"
                                        + "<td><strong>Refund ID</strong></td>"
                                        + "<td>"
                                        + refund.getId()
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Booking ID</strong></td>"
                                        + "<td>"
                                        + refund.getBooking().getId()
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Property</strong></td>"
                                        + "<td>"
                                        + propertyName
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Room</strong></td>"
                                        + "<td>"
                                        + roomName
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Refund Method</strong></td>"
                                        + "<td>"
                                        + refundMethod
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Refund Reference</strong></td>"
                                        + "<td>"
                                        + refundReference
                                        + "</td>"
                                        + "</tr>"

                                        + "<tr>"
                                        + "<td><strong>Processed</strong></td>"
                                        + "<td>"
                                        + processedAt
                                        + "</td>"
                                        + "</tr>"

                                        + "</table>"

                                        + "<p style=\"margin-top:25px;\">"
                                        + "A refund slip has been attached to this email "
                                        + "for your records."
                                        + "</p>"

                                        + "<p>"
                                        + "If you have any questions regarding this refund, "
                                        + "please contact the property owner."
                                        + "</p>"

                                        + "<p style=\"margin-top:30px;\">"
                                        + "Regards,<br>"
                                        + "<strong>StayBy Team</strong>"
                                        + "</p>"

                                        + "</div>";

                        helper.setText(
                                        htmlContent,
                                        true);

                        helper.addAttachment(
                                        "StayBy-Refund-Slip-"
                                                        + refund.getId()
                                                        + ".pdf",
                                        new ByteArrayResource(
                                                        refundSlip));

                        mailSender.send(message);

                } catch (MessagingException e) {

                        throw new RuntimeException(
                                        "Failed to send refund completion email",
                                        e);
                }
        }
}