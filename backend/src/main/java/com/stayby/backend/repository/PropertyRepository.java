package com.stayby.backend.repository;

import com.stayby.backend.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByPropertyTypeIgnoreCase(String propertyType);

    List<Property> findByCityIgnoreCaseAndPropertyTypeIgnoreCase(
            String city,
            String propertyType
    );

    List<Property> findByVerifiedTrue();

    List<Property> findByCityIgnoreCaseAndVerifiedTrue(
            String city
    );

    List<Property> findByCityIgnoreCaseAndPropertyTypeIgnoreCaseAndVerifiedTrue(
            String city,
            String propertyType
    );
}