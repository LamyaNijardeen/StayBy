package com.stayby.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/*
 * Sends a refund for a card payment to PayHere (Refund API).
 *
 * Needs an API key created in the PayHere dashboard
 * (Settings > API Keys, with "Automated Charging API" enabled).
 * Put its App ID and App Secret in .env:
 *   PAYHERE_APP_ID=...
 *   PAYHERE_APP_SECRET=...
 *
 * If they are missing, isConfigured() is false and the owner
 * refunds the card payment by hand instead.
 */
@Service
public class PayHereRefundService {

    private static final Pattern ACCESS_TOKEN =
            Pattern.compile("\"access_token\"\\s*:\\s*\"([^\"]+)\"");

    private static final Pattern STATUS =
            Pattern.compile("\"status\"\\s*:\\s*(-?\\d+)");

    private static final Pattern MESSAGE =
            Pattern.compile("\"msg\"\\s*:\\s*\"([^\"]*)\"");

    private static final Pattern DATA =
            Pattern.compile("\"data\"\\s*:\\s*\"?([^\",}]+)\"?");

    @Value("${payhere.app-id:}")
    private String appId;

    @Value("${payhere.app-secret:}")
    private String appSecret;

    @Value("${payhere.sandbox:true}")
    private boolean sandbox;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean isConfigured() {
        return appId != null
                && !appId.isBlank()
                && appSecret != null
                && !appSecret.isBlank();
    }

    /**
     * Refunds the FULL amount of a PayHere payment.
     *
     * @param payherePaymentId the payment_id PayHere sent in its notification
     * @return PayHere's refund number
     */
    public String refundPayment(
            String payherePaymentId,
            String description
    ) {

        if (!isConfigured()) {
            throw new IllegalArgumentException(
                    "Automatic PayHere refunds are not set up"
            );
        }

        String baseUrl = sandbox
                ? "https://sandbox.payhere.lk/merchant/v1"
                : "https://www.payhere.lk/merchant/v1";

        try {

            String accessToken = getAccessToken(baseUrl);

            String body = "{\"payment_id\":\""
                    + escapeJson(payherePaymentId)
                    + "\",\"description\":\""
                    + escapeJson(description)
                    + "\"}";

            HttpRequest request = HttpRequest
                    .newBuilder(URI.create(baseUrl + "/payment/refund"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            String json = response.body() == null ? "" : response.body();

            String status = find(STATUS, json);
            String message = find(MESSAGE, json);
            String data = find(DATA, json);

            if (!"1".equals(status)) {

                System.out.println(
                        "PayHere refund failed. HTTP "
                                + response.statusCode()
                                + " body: " + json
                );

                throw new IllegalArgumentException(
                        "PayHere could not refund this payment"
                                + (message.isBlank() ? "" : ": " + message)
                );
            }

            return data.isBlank() ? "OK" : data;

        } catch (IOException e) {

            throw new IllegalArgumentException(
                    "Could not reach PayHere. Please try again."
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new IllegalArgumentException(
                    "The PayHere refund was interrupted. Please try again."
            );
        }
    }

    private String getAccessToken(String baseUrl)
            throws IOException, InterruptedException {

        String credentials = Base64.getEncoder().encodeToString(
                (appId.trim() + ":" + appSecret.trim())
                        .getBytes(StandardCharsets.UTF_8)
        );

        HttpRequest request = HttpRequest
                .newBuilder(URI.create(baseUrl + "/oauth/token"))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "grant_type=client_credentials"
                ))
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        String token = find(
                ACCESS_TOKEN,
                response.body() == null ? "" : response.body()
        );

        if (token.isBlank()) {

            System.out.println(
                    "PayHere token request failed. HTTP "
                            + response.statusCode()
                            + " body: " + response.body()
            );

            throw new IllegalArgumentException(
                    "PayHere refunds are not set up correctly "
                            + "(check PAYHERE_APP_ID and PAYHERE_APP_SECRET)"
            );
        }

        return token;
    }

    private String find(Pattern pattern, String text) {

        Matcher matcher = pattern.matcher(text);

        return matcher.find() ? matcher.group(1).trim() : "";
    }

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", " ")
                .replace("\r", " ")
                .replace("\t", " ");
    }
}