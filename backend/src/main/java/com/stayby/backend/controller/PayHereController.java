package com.stayby.backend.controller;

import com.stayby.backend.service.PayHereService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/payhere")
public class PayHereController {

    private final PayHereService payHereService;

    public PayHereController(PayHereService payHereService) {
        this.payHereService = payHereService;
    }

    @PostMapping("/create/{bookingId}")
    public ResponseEntity<?> createCheckout(
            @PathVariable Long bookingId
    ) {
        try {
            Map<String, String> checkoutData =
                    payHereService.createCheckout(bookingId);

            return ResponseEntity.ok(checkoutData);

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

    @PostMapping("/notify")
    public ResponseEntity<?> handleNotification(
            @RequestParam Map<String, String> params
    ) {

        System.out.println("PayHere notification received");
        System.out.println("PayHere parameters: " + params);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "PayHere notification received"
                )
        );
    }
}