package com.stayby.backend.repository;

import com.stayby.backend.entity.Complaint;
import com.stayby.backend.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findByTravelerIdOrderByCreatedAtDesc(
            Long travelerId
    );

    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByStatusOrderByCreatedAtDesc(
            ComplaintStatus status
    );
}