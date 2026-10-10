package com.stayby.backend.controller;

import com.stayby.backend.entity.Complaint;
import com.stayby.backend.entity.ComplaintStatus;
import com.stayby.backend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

        private final ComplaintService complaintService;

        public ComplaintController(
                        ComplaintService complaintService) {
                this.complaintService = complaintService;
        }

        @PostMapping
        public ResponseEntity<?> createComplaint(
                        Authentication authentication,
                        @RequestBody Map<String, String> request) {

                try {

                        if (authentication == null
                                        || !authentication.isAuthenticated()) {

                                return ResponseEntity
                                                .status(401)
                                                .body(
                                                                Map.of(
                                                                                "message",
                                                                                "Authentication required"));
                        }

                        Long travelerId = Long.valueOf(
                                        authentication.getName());

                        Long bookingId = Long.valueOf(
                                        request.get("bookingId"));

                        Complaint complaint = complaintService.createComplaint(
                                        travelerId,
                                        bookingId,
                                        request.get("subject"),
                                        request.get("description"));

                        return ResponseEntity.ok(
                                        toResponse(complaint));

                } catch (NumberFormatException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        "Invalid booking ID"));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        e.getMessage()));
                }
        }

        @GetMapping("/my")
        public ResponseEntity<?> getMyComplaints(
                        Authentication authentication) {

                try {

                        if (authentication == null
                                        || !authentication.isAuthenticated()) {

                                return ResponseEntity
                                                .status(401)
                                                .body(
                                                                Map.of(
                                                                                "message",
                                                                                "Authentication required"));
                        }

                        Long travelerId = Long.valueOf(
                                        authentication.getName());

                        List<Complaint> complaints = complaintService
                                        .getTravelerComplaints(
                                                        travelerId);

                        return ResponseEntity.ok(
                                        complaints.stream()
                                                        .map(this::toResponse)
                                                        .toList());

                } catch (NumberFormatException e) {

                        return ResponseEntity
                                        .status(401)
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        "Invalid authentication"));
                }
        }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/admin")
        public ResponseEntity<?> getAllComplaints(
                        Authentication authentication) {

                try {

                        if (authentication == null
                                        || !authentication.isAuthenticated()) {

                                return ResponseEntity
                                                .status(401)
                                                .body(
                                                                Map.of(
                                                                                "message",
                                                                                "Authentication required"));
                        }

                        List<Complaint> complaints = complaintService
                                        .getAllComplaints();

                        return ResponseEntity.ok(
                                        complaints.stream()
                                                        .map(this::toResponse)
                                                        .toList());

                } catch (Exception e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        e.getMessage()));
                }
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/admin/{complaintId}/status")
        public ResponseEntity<?> updateStatus(
                        Authentication authentication,
                        @PathVariable Long complaintId,
                        @RequestBody Map<String, String> request) {

                try {

                        if (authentication == null
                                        || !authentication.isAuthenticated()) {

                                return ResponseEntity
                                                .status(401)
                                                .body(
                                                                Map.of(
                                                                                "message",
                                                                                "Authentication required"));
                        }

                        ComplaintStatus status = ComplaintStatus.valueOf(
                                        request
                                                        .get("status")
                                                        .toUpperCase());

                        Complaint complaint = complaintService.updateStatus(
                                        complaintId,
                                        status);

                        return ResponseEntity.ok(
                                        toResponse(complaint));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        "Invalid complaint status"));
                }
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/admin/{complaintId}/response")
        public ResponseEntity<?> updateAdminResponse(
                        Authentication authentication,
                        @PathVariable Long complaintId,
                        @RequestBody Map<String, String> request) {

                try {

                        if (authentication == null
                                        || !authentication.isAuthenticated()) {

                                return ResponseEntity
                                                .status(401)
                                                .body(
                                                                Map.of(
                                                                                "message",
                                                                                "Authentication required"));
                        }

                        Complaint complaint = complaintService.updateAdminResponse(
                                        complaintId,
                                        request.get("adminResponse"));

                        return ResponseEntity.ok(
                                        toResponse(complaint));

                } catch (IllegalArgumentException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        Map.of(
                                                                        "message",
                                                                        e.getMessage()));
                }
        }

       private Map<String, Object> toResponse(
        Complaint complaint) {

    Map<String, Object> response = new HashMap<>();

    response.put("id", complaint.getId());
    response.put(
            "bookingId",
            complaint.getBooking().getId()
    );
    response.put(
            "travelerId",
            complaint.getTraveler().getId()
    );
    response.put(
            "travelerName",
            complaint.getTraveler().getName()
    );
    response.put(
            "travelerEmail",
            complaint.getTraveler().getEmail()
    );
    response.put(
            "subject",
            complaint.getSubject()
    );
    response.put(
            "description",
            complaint.getDescription()
    );
    response.put(
            "adminResponse",
            complaint.getAdminResponse() == null
                    ? ""
                    : complaint.getAdminResponse()
    );
    response.put(
            "status",
            complaint.getStatus().name()
    );
    response.put(
            "createdAt",
            complaint.getCreatedAt()
    );
    response.put(
            "updatedAt",
            complaint.getUpdatedAt()
    );

    return response;
}
}