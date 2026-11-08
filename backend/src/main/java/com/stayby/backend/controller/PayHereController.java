package com.stayby.backend.controller;

import com.stayby.backend.service.PayHereService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/payhere")
public class PayHereController {

    private final PayHereService payHereService;

    public PayHereController(PayHereService payHereService) {
        this.payHereService = payHereService;
    }

    // =========================================================
    // CREATE CHECKOUT (traveler, must own the booking)
    // =========================================================

    @PostMapping("/create/{bookingId}")
    public ResponseEntity<?> createCheckout(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        try {
            Long userId = Long.valueOf(authentication.getName());

            Map<String, String> checkoutData =
                    payHereService.createCheckout(bookingId, userId);

            return ResponseEntity.ok(checkoutData);

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid authentication"));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            e.getMessage()
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message",
                            "Unable to create PayHere checkout"
                    )
            );
        }
    }

    // =========================================================
    // PAYHERE SERVER-TO-SERVER NOTIFICATION (public endpoint)
    //
    // PayHere calls this URL after a payment attempt.
    // The request is trusted ONLY if its md5sig is valid.
    // =========================================================

    @PostMapping("/notify")
    public ResponseEntity<?> handleNotification(
            @RequestParam Map<String, String> params
    ) {

        try {

            payHereService.handleNotification(params);

            return ResponseEntity.ok("OK");

        } catch (IllegalArgumentException e) {

            System.out.println(
                    "PayHere notification rejected: " + e.getMessage()
            );

            return ResponseEntity
                    .badRequest()
                    .body("Invalid notification");

        } catch (Exception e) {

            System.out.println(
                    "PayHere notification failed: " + e.getMessage()
            );

            return ResponseEntity
                    .internalServerError()
                    .body("Unable to process notification");
        }
    }
}