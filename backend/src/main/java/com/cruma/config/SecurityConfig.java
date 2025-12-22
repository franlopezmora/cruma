package com.cruma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Desactivar CSRF para APIs
                .csrf(csrf -> csrf.disable())
                
                // Autorización
                .authorizeHttpRequests(auth -> auth
                        // Swagger sin auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/actuator/**").permitAll()
                        // Logout sin auth
                        .requestMatchers("/api/auth/logout").permitAll()
                        // Endpoints protegidos
                        .requestMatchers("/api/auth/me",
                                "/api/cronogramas/**",
                                "/api/correlativas/estado/**").authenticated()
                        // Resto público
                        .anyRequest().permitAll()
                )
                
                // OAuth2 Login
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("http://localhost:3000/", true)
                )
                
                // Logout de Spring Security (deshabilitado, usamos nuestro endpoint)
                .logout(logout -> logout.disable());

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of("http://localhost:3000"));
        cors.setAllowedMethods(List.of("GET", "POST", "OPTIONS", "PUT", "DELETE"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
