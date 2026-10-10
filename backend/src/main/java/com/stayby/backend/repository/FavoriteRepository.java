package com.stayby.backend.repository;

import com.stayby.backend.entity.Favorite;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    boolean existsByUserAndProperty(User user, Property property);

    void deleteByUserAndProperty(User user, Property property);

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
}