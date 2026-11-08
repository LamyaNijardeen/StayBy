package com.stayby.backend.security;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import com.stayby.backend.repository.UserRepository;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

        @Value("${stayby.jwt.secret}")
        private String jwtSecret;

        /**
         * Address(es) of the website allowed to call this API (CORS).
         * Several can be given, separated by commas.
         */
        @Value("${stayby.frontend-url:http://localhost:5173}")
        private String frontendUrl;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecretKey jwtSecretKey() {
                return new SecretKeySpec(
                                jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                "HmacSHA256");
        }

        @Bean
        public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
                return NimbusJwtEncoder.withSecretKey(jwtSecretKey).build();
        }

        @Bean
        public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
                return NimbusJwtDecoder
                                .withSecretKey(jwtSecretKey)
                                .macAlgorithm(MacAlgorithm.HS256)
                                .build();
        }

        @Bean
        public Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter(
                        UserRepository userRepository) {

                JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

                authoritiesConverter.setAuthoritiesClaimName("role");
                authoritiesConverter.setAuthorityPrefix("ROLE_");

                JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

                converter.setJwtGrantedAuthoritiesConverter(
                                authoritiesConverter);

                // Also rejects tokens of suspended users, so a suspension
                // takes effect immediately, not only at the next login.
                return jwt -> {

                        try {
                                Long userId = Long.valueOf(jwt.getSubject());

                                boolean suspended = userRepository
                                                .findById(userId)
                                                .map(u -> u.isSuspended())
                                                .orElse(false);

                                if (suspended) {
                                        throw new DisabledException(
                                                        "Account suspended");
                                }
                        } catch (NumberFormatException ignored) {
                                // subject is not a user id: nothing to check
                        }

                        return converter.convert(jwt);
                };
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                java.util.Arrays.stream(frontendUrl.split(","))
                                                .map(String::trim)
                                                .map(u -> u.replaceAll("/+$", ""))
                                                .filter(u -> !u.isEmpty())
                                                .toList());

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "PATCH",
                                                "DELETE",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(
                                List.of(
                                                "Authorization",
                                                "Content-Type"));

                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtDecoder jwtDecoder,
                        Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter) throws Exception {

                http
                                .cors(cors -> {
                                })
                                .csrf(AbstractHttpConfigurer::disable)

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // Login and registration
                                                .requestMatchers(
                                                                "/api/auth/**")
                                                .permitAll()

                                                // Property images are publicly accessible
                                                .requestMatchers(
                                                                "/uploads/**")
                                                .permitAll()

                                                // Public property browsing and search
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/properties",
                                                                "/api/properties/search",
                                                                "/api/properties/*",
                                                                "/api/properties/*/rooms/available",
                                                                "/api/properties/*/rooms/available-dates",
                                                                "/api/properties/*/images",
                                                                "/api/properties/*/landmarks",
                                                                "/api/landmarks/suggest",
                                                                "/api/reviews/property/*",
                                                                "/api/rooms/*/images")
                                                .permitAll()
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/payments/payhere/notify")
                                                .permitAll()

                                                // All other endpoints require authentication
                                                .anyRequest().authenticated())

                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt
                                                                .decoder(jwtDecoder)
                                                                .jwtAuthenticationConverter(
                                                                                jwtAuthenticationConverter)));

                return http.build();
        }
}