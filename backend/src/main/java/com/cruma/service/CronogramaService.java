package com.cruma.service;

import com.cruma.dto.BloqueCronogramaDTO;
import com.cruma.dto.CrearCronogramaDTO;
import com.cruma.exception.AccessDeniedException;
import com.cruma.exception.ComisionMateriaHorarioNotFoundException;
import com.cruma.exception.CronogramaNotFoundException;
import com.cruma.exception.LimiteCronogramasExcedidoException;
import com.cruma.model.ComisionMateriaHorario;
import com.cruma.model.Cronograma;
import com.cruma.model.DetalleCronograma;
import com.cruma.model.DetalleEstadoEnum;
import com.cruma.model.Usuario;
import com.cruma.repository.ComisionMateriaHorarioRepository;
import com.cruma.repository.CronogramaRepository;
import com.cruma.repository.UsuarioRepository;
import com.cruma.util.OAuth2UserHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CronogramaService {

    private final CronogramaRepository repo;
    private final UsuarioRepository usuarioRepository;
    private final ComisionMateriaHorarioRepository cmhRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    // Mapeo de día numérico a nombre de día en español (mayúsculas)
    private static final String[] DIAS_SEMANA = {"", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"};

    public CronogramaService(CronogramaRepository repo, UsuarioRepository usuarioRepository, 
                             ComisionMateriaHorarioRepository cmhRepository,
                             OAuth2AuthorizedClientService authorizedClientService) {
        this.repo = repo;
        this.usuarioRepository = usuarioRepository;
        this.cmhRepository = cmhRepository;
        this.authorizedClientService = authorizedClientService;
    }

    /** Obtiene el usuario autenticado desde la sesión */
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

    /** Lista todos los cronogramas del usuario autenticado */
    @Transactional(readOnly = true)
    public List<Cronograma> listByUsuarioAutenticado(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return repo.findByUsuarioId(usuario.getId());
    }

    /** Crea o actualiza un cronograma asociado al usuario autenticado */
    @Transactional
    public Cronograma save(Cronograma c, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        c.setUsuario(usuario);
        return repo.save(c);
    }

    /** Crea un cronograma desde un DTO con bloques */
    @Transactional
    public Cronograma crearDesdeDTO(CrearCronogramaDTO dto, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        
        // Validar límite de cronogramas por usuario (máximo 3)
        List<Cronograma> cronogramasExistentes = repo.findByUsuarioId(usuario.getId());
        final int LIMITE_CRONOGRAMAS = 3;
        if (cronogramasExistentes.size() >= LIMITE_CRONOGRAMAS) {
            throw new LimiteCronogramasExcedidoException(LIMITE_CRONOGRAMAS, cronogramasExistentes.size());
        }
        
        Cronograma cronograma = new Cronograma();
        cronograma.setNombre(dto.getNombre());
        cronograma.setUsuario(usuario);
        
        List<DetalleCronograma> detalles = new ArrayList<>();
        
        for (BloqueCronogramaDTO bloque : dto.getBloques()) {
            // Convertir día numérico a nombre de día
            String diaSemana = convertirDiaANombre(bloque.getDia());
            if (diaSemana == null) {
                throw new RuntimeException("Día inválido: " + bloque.getDia());
            }
            
            // Convertir horas String a LocalTime
            // Normalizar formato: asegurar que tenga formato HH:mm (dos dígitos)
            String horaEntradaNormalizada = normalizarHora(bloque.getHoraEntrada());
            String horaSalidaNormalizada = normalizarHora(bloque.getHoraSalida());
            LocalTime horaInicio = LocalTime.parse(horaEntradaNormalizada);
            LocalTime horaFin = LocalTime.parse(horaSalidaNormalizada);
            
            // Primero intentar búsqueda exacta
            var cmhOpt = cmhRepository.findByMateriaComisionPeriodoHorario(
                    bloque.getMateriaId(),
                    bloque.getComisionId(),
                    dto.getPeriodoId(),
                    diaSemana,
                    horaInicio,
                    horaFin
            );
            
            // Si no se encuentra exacto, buscar todos los horarios y filtrar por solapamiento
            if (cmhOpt.isEmpty()) {
                List<ComisionMateriaHorario> todosLosHorarios = cmhRepository.findByMateriaComisionPeriodo(
                        bloque.getMateriaId(),
                        bloque.getComisionId(),
                        dto.getPeriodoId()
                );
                
                // Filtrar por día y solapamiento de horarios
                cmhOpt = todosLosHorarios.stream()
                        .filter(cmh -> {
                            var horario = cmh.getHorario();
                            String diaBD = horario.getDiaSemana();
                            // Comparar día: puede ser número o nombre
                            boolean diaCoincide = diaBD.equalsIgnoreCase(diaSemana) 
                                    || diaBD.equals(bloque.getDia()); // También comparar con el número original
                            if (!diaCoincide) {
                                return false;
                            }
                            // Verificar solapamiento de horarios
                            // Dos intervalos se solapan si: inicio1 < fin2 && inicio2 < fin1
                            LocalTime hInicio = horario.getHoraInicio();
                            LocalTime hFin = horario.getHoraFin();
                            return horaInicio.isBefore(hFin) && hInicio.isBefore(horaFin);
                        })
                        .findFirst();
            }
            
            if (cmhOpt.isEmpty()) {
                // Intentar buscar sin restricción de horario exacto, solo por día
                List<ComisionMateriaHorario> todosLosHorarios = cmhRepository.findByMateriaComisionPeriodo(
                        bloque.getMateriaId(),
                        bloque.getComisionId(),
                        dto.getPeriodoId()
                );
                
                cmhOpt = todosLosHorarios.stream()
                        .filter(cmh -> {
                            String diaBD = cmh.getHorario().getDiaSemana();
                            // Comparar día: puede ser número o nombre
                            return diaBD.equalsIgnoreCase(diaSemana) 
                                    || diaBD.equals(bloque.getDia()); // También comparar con el número original
                        })
                        .findFirst();
            }
            
            if (cmhOpt.isEmpty()) {
                // Último intento: buscar sin restricción de periodo
                // Esto puede ser necesario si el periodoId del frontend (0 o 1) no coincide con los IDs reales
                List<ComisionMateriaHorario> todosLosHorarios = cmhRepository.findByMateriaComision(
                        bloque.getMateriaId(),
                        bloque.getComisionId()
                );
                
                // Primero intentar búsqueda exacta de horario
                // Nota: dia_semana en BD puede estar como "1", "2", etc. o como "LUNES", "MARTES", etc.
                cmhOpt = todosLosHorarios.stream()
                        .filter(cmh -> {
                            var horario = cmh.getHorario();
                            String diaBD = horario.getDiaSemana();
                            // Comparar día: puede ser número o nombre
                            boolean diaCoincide = diaBD.equalsIgnoreCase(diaSemana) 
                                    || diaBD.equals(bloque.getDia()); // También comparar con el número original
                            return diaCoincide
                                    && horario.getHoraInicio().equals(horaInicio)
                                    && horario.getHoraFin().equals(horaFin);
                        })
                        .findFirst();
                
                // Si no encuentra exacto, buscar por solapamiento
                if (cmhOpt.isEmpty()) {
                    cmhOpt = todosLosHorarios.stream()
                            .filter(cmh -> {
                                var horario = cmh.getHorario();
                                String diaBD = horario.getDiaSemana();
                                // Comparar día: puede ser número o nombre
                                boolean diaCoincide = diaBD.equalsIgnoreCase(diaSemana) 
                                        || diaBD.equals(bloque.getDia()); // También comparar con el número original
                                if (!diaCoincide) {
                                    return false;
                                }
                                // Verificar solapamiento
                                LocalTime hInicio = horario.getHoraInicio();
                                LocalTime hFin = horario.getHoraFin();
                                return horaInicio.isBefore(hFin) && hInicio.isBefore(horaFin);
                            })
                            .findFirst();
                }
            }
            
            if (cmhOpt.isEmpty()) {
                // Construir mensaje de error más informativo
                // Buscar en todos los periodos para mostrar qué hay disponible
                List<ComisionMateriaHorario> todosLosHorarios = cmhRepository.findByMateriaComision(
                        bloque.getMateriaId(),
                        bloque.getComisionId()
                );
                
                String horariosEncontrados = todosLosHorarios.stream()
                        .map(cmh -> {
                            var h = cmh.getHorario();
                            var periodo = cmh.getComisionMateria().getPeriodo();
                            return String.format("%s %s-%s (periodoId=%d)", h.getDiaSemana(), h.getHoraInicio(), h.getHoraFin(), periodo.getId());
                        })
                        .collect(Collectors.joining(", "));
                
                throw new ComisionMateriaHorarioNotFoundException(
                        String.format("No se encontró ComisionMateriaHorario para materiaId=%d, comisionId=%d, periodoId=%d, dia=%s, hora=%s-%s. Horarios disponibles en BD (todos los periodos): [%s]",
                                bloque.getMateriaId(), bloque.getComisionId(), dto.getPeriodoId(), diaSemana, horaInicio, horaFin,
                                horariosEncontrados.isEmpty() ? "ninguno" : horariosEncontrados)
                );
            }
            
            DetalleCronograma detalle = new DetalleCronograma();
            detalle.setCronograma(cronograma);
            detalle.setComisionMateriaHorario(cmhOpt.get());
            detalle.setEstado(DetalleEstadoEnum.SELECCIONADO);
            detalles.add(detalle);
        }
        
        cronograma.setDetalles(detalles);
        return repo.save(cronograma);
    }

    /** Convierte un día numérico (String "1"-"6") a nombre de día en mayúsculas */
    private String convertirDiaANombre(String diaStr) {
        try {
            int diaNum = Integer.parseInt(diaStr);
            if (diaNum >= 1 && diaNum <= 6) {
                return DIAS_SEMANA[diaNum];
            }
        } catch (NumberFormatException e) {
            // Si ya viene como nombre, devolverlo en mayúsculas
            return diaStr.toUpperCase();
        }
        return null;
    }

    /** Normaliza el formato de hora para que tenga formato HH:mm (dos dígitos) */
    private String normalizarHora(String hora) {
        if (hora == null || hora.isBlank()) {
            throw new RuntimeException("Hora inválida: " + hora);
        }
        // Si ya tiene formato HH:mm, devolverlo tal cual
        if (hora.matches("\\d{2}:\\d{2}")) {
            return hora;
        }
        // Si tiene formato H:mm, agregar cero al inicio
        if (hora.matches("\\d{1}:\\d{2}")) {
            return "0" + hora;
        }
        // Si no coincide con ningún formato esperado, intentar parsearlo directamente
        return hora;
    }

    /** Obtiene un cronograma solo si pertenece al usuario autenticado */
    @Transactional(readOnly = true)
    public Cronograma getOne(Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        Cronograma cronograma = repo.findById(id)
                .orElseThrow(() -> new CronogramaNotFoundException(id));
        
        // Verificar que el cronograma pertenezca al usuario autenticado
        if (!cronograma.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("No tienes permiso para acceder a este cronograma");
        }
        
        return cronograma;
    }

    /** Elimina un cronograma solo si pertenece al usuario autenticado */
    @Transactional
    public void delete(Long id, Authentication authentication) {
        // Verificar que el cronograma pertenezca al usuario antes de eliminar
        getOne(id, authentication);
        repo.deleteById(id);
    }
}
