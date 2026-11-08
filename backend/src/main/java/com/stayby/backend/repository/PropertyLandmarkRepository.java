package com.stayby.backend.repository;

import com.stayby.backend.entity.PropertyLandmark;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

public interface PropertyLandmarkRepository
        extends JpaRepository<PropertyLandmark, Long> {

    @Query("select l from PropertyLandmark l "
            + "where l.property.id = :propertyId "
            + "order by l.distanceKm asc")
    List<PropertyLandmark> findByPropertyIdSorted(
            @Param("propertyId") Long propertyId);

    @Query("select l from PropertyLandmark l "
            + "where l.property.id in :propertyIds "
            + "order by l.distanceKm asc")
    List<PropertyLandmark> findByPropertyIds(
            @Param("propertyIds") Collection<Long> propertyIds);

    @Transactional
    @Modifying
    @Query("delete from PropertyLandmark l where l.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);

    // Names offered as search suggestions (verified properties only).
    @Query("select distinct l.name from PropertyLandmark l "
            + "where l.property.verified = true "
            + "and lower(l.name) like lower(concat('%', :q, '%')) "
            + "order by l.name asc")
    List<String> suggestNames(
            @Param("q") String q,
            Pageable pageable);
}