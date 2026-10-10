package com.stayby.backend.service;

import com.stayby.backend.entity.Favorite;
import com.stayby.backend.entity.Property;
import com.stayby.backend.entity.User;
import com.stayby.backend.repository.FavoriteRepository;
import com.stayby.backend.repository.PropertyRepository;
import com.stayby.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository
    ) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Favorite addFavorite(Long userId, Long propertyId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found")
                );

        if (favoriteRepository.existsByUserAndProperty(user, property)) {
            throw new RuntimeException("Property is already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProperty(property);

        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found")
                );

        if (!favoriteRepository.existsByUserAndProperty(user, property)) {
            throw new RuntimeException("Property is not in favorites");
        }

        favoriteRepository.deleteByUserAndProperty(user, property);
    }

    @Transactional(readOnly = true)
    public List<Favorite> getUserFavorites(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return favoriteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long propertyId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found")
                );

        return favoriteRepository.existsByUserAndProperty(user, property);
    }
}