package com.cruma.controller;

import com.cruma.dto.UsuarioDTO;
import com.cruma.model.Usuario;
import com.cruma.repository.UsuarioRepository;
import com.cruma.util.OAuth2UserHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public AuthController(UsuarioRepository usuarioRepository, OAuth2AuthorizedClientService authorizedClientService) {
        this.usuarioRepository = usuarioRepository;
        this.authorizedClientService = authorizedClientService;
    }

    /**
     * Devuelve el usuario autenticado actualmente, o 401 si no hay sesión.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!(authentication.getPrincipal() instanceof OAuth2User oAuth2User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = OAuth2UserHelper.extractEmail(oAuth2User, authentication, authorizedClientService);
        String nombre = OAuth2UserHelper.extractName(oAuth2User);

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No se pudo obtener el email"));
        }

        String proveedor = OAuth2UserHelper.determinarProveedor(authentication);
        
        Optional<Usuario> existente = usuarioRepository.findByMailWithProveedores(email);
        Usuario usuario;
        
        if (existente.isPresent()) {
            usuario = existente.get();
            usuario.agregarProveedor(proveedor);
            if (nombre != null && !nombre.isBlank()) {
                usuario.setNombre(nombre);
            }
            usuario = usuarioRepository.save(usuario);
        } else {
            usuario = new Usuario();
            usuario.setId(UUID.randomUUID());
            usuario.setMail(email);
            usuario.setNombre(nombre != null && !nombre.isBlank() ? nombre : email);
            usuario.agregarProveedor(proveedor);
            usuario = usuarioRepository.save(usuario);
        }

        // Crear DTO para evitar referencias circulares en JSON
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setMail(usuario.getMail());
        dto.setNombre(usuario.getNombre() != null && !usuario.getNombre().isBlank() 
            ? usuario.getNombre() 
            : usuario.getMail());

        return ResponseEntity.ok(dto);
    }

    /**
     * Logout: invalida la sesión y elimina la cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Limpiar SecurityContext
            SecurityContextHolder.clearContext();
            
            // Invalidar sesión
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            
            // Eliminar cookie JSESSIONID
            Cookie cookie = new Cookie("JSESSIONID", "");
            cookie.setPath("/");
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);
            response.addCookie(cookie);
            
            return ResponseEntity.ok(Map.of("message", "Logout exitoso"));
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al hacer logout"));
        }
    }

}
