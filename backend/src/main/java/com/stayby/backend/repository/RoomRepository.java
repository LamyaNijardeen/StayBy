package com.stayby.backend.repository;

import com.stayby.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByPropertyId(Long propertyId);

    List<Room> findByPropertyIdAndAvailableTrue(Long propertyId);
    
    List<Room> findByPropertyIdAndAvailableTrueAndCapacityGreaterThanEqual(
        Long propertyId,
        Integer guests
);
      
}