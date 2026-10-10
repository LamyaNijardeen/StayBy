package com.stayby.backend.repository;

import com.stayby.backend.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyImageRepository
        extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByPropertyId(Long propertyId);

    void deleteByPropertyId(Long propertyId);
}
