package com.cruma.service;

import com.cruma.dto.EstadoCorrelativasResponseDTO;
import com.cruma.dto.MateriaEstadoDTO;
import com.cruma.dto.ResumenCorrelativasDTO;
import com.cruma.model.Materia;
import com.cruma.model.Usuario;
import com.cruma.model.UsuarioMateriaEstado;
import com.cruma.model.UsuarioMateriaEstadoId;
import com.cruma.repository.UsuarioMateriaEstadoRepository;
import com.cruma.repository.UsuarioRepository;
import com.cruma.util.OAuth2UserHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class EstadoCorrelativasService {

    private final UsuarioMateriaEstadoRepository estadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public EstadoCorrelativasService(UsuarioMateriaEstadoRepository estadoRepository,
                                     UsuarioRepository usuarioRepository,
                                     OAuth2AuthorizedClientService authorizedClientService) {
        this.estadoRepository = estadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.authorizedClientService = authorizedClientService;
    }

    @Transactional(readOnly = true)
    public EstadoCorrelativasResponseDTO obtener(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        List<UsuarioMateriaEstado> registros = estadoRepository.findByUsuario_Id(usuario.getId());
        return construirRespuesta(registros);
    }

    @Transactional
    public EstadoCorrelativasResponseDTO guardar(List<MateriaEstadoDTO> estados, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        estadoRepository.deleteByUsuario_Id(usuario.getId());

        if (estados == null || estados.isEmpty()) {
            return new EstadoCorrelativasResponseDTO(null, List.of(), new ResumenCorrelativasDTO(0, 0, 0, 0, 0));
        }

        Instant ahora = Instant.now();
        List<UsuarioMateriaEstado> entidades = new ArrayList<>();
        for (MateriaEstadoDTO estadoDTO : estados) {
            if (estadoDTO.getMateriaId() == null) {
                continue;
            }
            UsuarioMateriaEstado entidad = new UsuarioMateriaEstado();
            entidad.setId(new UsuarioMateriaEstadoId(usuario.getId(), estadoDTO.getMateriaId()));
            entidad.setUsuario(usuario);

            Materia materiaRef = new Materia();
            materiaRef.setId(estadoDTO.getMateriaId());
            entidad.setMateria(materiaRef);

            short estadoNormalizado = OptionalIntValue.of(estadoDTO.getEstado()).orElse((short) 0);
            entidad.setEstado(estadoNormalizado);
            entidad.setUpdatedAt(ahora);
            entidades.add(entidad);
        }

        List<UsuarioMateriaEstado> guardados = estadoRepository.saveAll(entidades);
        return construirRespuesta(guardados);
    }

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User oAuth2User)) {
            throw new org.springframework.security.authentication.BadCredentialsException("No autenticado");
        }
        String email = OAuth2UserHelper.extractEmail(oAuth2User, authentication, authorizedClientService);
        if (email == null || email.isBlank()) {
            throw new org.springframework.security.authentication.BadCredentialsException("No se pudo obtener el email del usuario");
        }
        return usuarioRepository.findByMail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private EstadoCorrelativasResponseDTO construirRespuesta(List<UsuarioMateriaEstado> registros) {
        List<MateriaEstadoDTO> dtoList = registros.stream()
                .map(r -> new MateriaEstadoDTO(
                        r.getId().getMateriaId(),
                        r.getEstado() != null ? r.getEstado().intValue() : 0
                ))
                .collect(Collectors.toList());

        Instant ultimaActualizacion = registros.stream()
                .map(UsuarioMateriaEstado::getUpdatedAt)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);

        ResumenCorrelativasDTO resumen = construirResumen(dtoList);

        return new EstadoCorrelativasResponseDTO(ultimaActualizacion, dtoList, resumen);
    }

    private ResumenCorrelativasDTO construirResumen(List<MateriaEstadoDTO> estados) {
        int bloqueadas = 0;
        int habilitadas = 0;
        int regulares = 0;
        int aprobadas = 0;

        for (MateriaEstadoDTO estado : estados) {
            int val = estado.getEstado() != null ? estado.getEstado() : 0;
            switch (val) {
                case 1 -> habilitadas++;
                case 2 -> regulares++;
                case 3 -> aprobadas++;
                default -> bloqueadas++;
            }
        }

        int total = estados.size();
        return new ResumenCorrelativasDTO(bloqueadas, habilitadas, regulares, aprobadas, total);
    }

    /**
     * Pequeño helper para convertir Integer a short con valor por defecto.
     */
    private static class OptionalIntValue {
        private final Integer value;

        private OptionalIntValue(Integer value) {
            this.value = value;
        }

        static OptionalIntValue of(Integer value) {
            return new OptionalIntValue(value);
        }

        short orElse(short defaultValue) {
            if (value == null) {
                return defaultValue;
            }
            return value.shortValue();
        }
    }
}

