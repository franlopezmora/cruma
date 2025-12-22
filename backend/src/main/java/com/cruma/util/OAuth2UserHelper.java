package com.cruma.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Utilidad para extraer información de usuarios OAuth2.
 * Centraliza la lógica de extracción de email y nombre para evitar duplicación.
 */
public class OAuth2UserHelper {

    private static final String GITHUB_EMAILS_API = "https://api.github.com/user/emails";

    /**
     * Extrae el email del usuario OAuth2.
     * 
     * @param user el usuario OAuth2
     * @param authentication la autenticación actual
     * @param authorizedClientService servicio para obtener tokens de acceso
     * @return el email del usuario, o null si no se puede obtener
     */
    public static String extractEmail(OAuth2User user, Authentication authentication, 
                                     OAuth2AuthorizedClientService authorizedClientService) {
        // Google OIDC
        if (user instanceof OidcUser oidcUser) {
            return oidcUser.getEmail();
        }
        
        // GitHub: primero intentar obtener email de los atributos
        Map<String, Object> attrs = user.getAttributes();
        Object email = attrs.get("email");
        if (email instanceof String s && !s.isBlank()) {
            return s;
        }
        
        // Si no hay email en atributos, intentar obtenerlo de la API de GitHub
        if (authentication instanceof OAuth2AuthenticationToken token) {
            String registrationId = token.getAuthorizedClientRegistrationId();
            if ("github".equals(registrationId)) {
                String githubEmail = obtenerEmailDeGitHub(token, authorizedClientService);
                if (githubEmail != null) {
                    return githubEmail;
                }
            }
        }
        
        // Fallback: usar login como último recurso
        Object login = attrs.get("login");
        if (login instanceof String s) {
            return s + "@github.local";
        }
        return null;
    }

    /**
     * Extrae el nombre del usuario OAuth2.
     * 
     * @param user el usuario OAuth2
     * @return el nombre del usuario, o null si no se puede obtener
     */
    public static String extractName(OAuth2User user) {
        if (user instanceof OidcUser oidcUser) {
            String name = oidcUser.getFullName();
            if (name != null && !name.isBlank()) {
                return name;
            }
        }
        Map<String, Object> attrs = user.getAttributes();
        Object name = attrs.get("name");
        if (name instanceof String s && !s.isBlank()) {
            return s;
        }
        Object login = attrs.get("login");
        if (login instanceof String s) {
            return s;
        }
        return null;
    }

    /**
     * Determina el proveedor OAuth2 basado en la autenticación.
     * 
     * @param authentication la autenticación actual
     * @return "google" o "github"
     */
    public static String determinarProveedor(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OidcUser) {
            return "google";
        }
        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            Map<String, Object> attrs = oAuth2User.getAttributes();
            if (attrs.containsKey("login") && attrs.get("id") instanceof Number) {
                return "github";
            }
        }
        return "google";
    }

    /**
     * Obtiene el email de GitHub haciendo una llamada a la API /user/emails
     */
    private static String obtenerEmailDeGitHub(OAuth2AuthenticationToken token, 
                                              OAuth2AuthorizedClientService authorizedClientService) {
        try {
            OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(),
                token.getName()
            );
            
            if (authorizedClient == null) {
                return null;
            }
            
            OAuth2AccessToken accessTokenObj = authorizedClient.getAccessToken();
            if (accessTokenObj == null) {
                return null;
            }
            
            String accessToken = accessTokenObj.getTokenValue();
            
            RestTemplate restTemplate = new RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<EmailInfo[]> response = restTemplate.exchange(
                GITHUB_EMAILS_API,
                org.springframework.http.HttpMethod.GET,
                entity,
                EmailInfo[].class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Buscar el email primario
                for (EmailInfo emailInfo : response.getBody()) {
                    if (emailInfo.primary != null && emailInfo.primary) {
                        return emailInfo.email;
                    }
                }
                // Si no hay primario, buscar el primero verificado
                for (EmailInfo emailInfo : response.getBody()) {
                    if (emailInfo.verified != null && emailInfo.verified && emailInfo.email != null) {
                        return emailInfo.email;
                    }
                }
                // Si no hay verificado, usar el primero
                if (response.getBody().length > 0 && response.getBody()[0].email != null) {
                    return response.getBody()[0].email;
                }
            }
        } catch (Exception e) {
            // Si falla, continuar con el fallback silenciosamente
        }
        return null;
    }
    
    /**
     * Clase auxiliar para deserializar la respuesta de GitHub /user/emails
     */
    private static class EmailInfo {
        public String email;
        public Boolean primary;
        public Boolean verified;
    }
}

