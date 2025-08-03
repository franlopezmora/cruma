package com.cruma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1) Activa CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2) Desactiva CSRF
            .csrf(csrf -> csrf.disable())
            // 3) Sin autenticación
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        // Permitir *todos* los orígenes (o pon tu dominio explícito)
        cors.setAllowedOriginPatterns(List.of("*"));
        // O si prefieres un origen fijo:
        // cors.setAllowedOrigins(List.of("http://localhost:3000", "http://tudominio.com"));

        cors.setAllowedMethods(List.of("GET", "POST", "OPTIONS", "PUT", "DELETE"));
        cors.setAllowedHeaders(List.of("*"));
        // Si vas a usar cookies o header Authorization:
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica a todas las rutas de tu API
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }
}
