package com.cruma.controller;

import com.cruma.dto.CrearCronogramaDTO;
import com.cruma.dto.CronogramaDTO;
import com.cruma.model.Cronograma;
import com.cruma.model.DetalleCronograma;
import com.cruma.service.CronogramaService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cronogramas")
public class CronogramaController {

    private final CronogramaService svc;

    public CronogramaController(CronogramaService svc) {
        this.svc = svc;
    }

    /** GET /api/cronogramas - Lista todos los cronogramas del usuario autenticado */
    @GetMapping
    public List<CronogramaDTO> list(Authentication authentication) {
        return svc.listByUsuarioAutenticado(authentication).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /** GET /api/cronogramas/{id} - Obtiene un cronograma del usuario autenticado */
    @GetMapping("/{id}")
    public CronogramaDTO getOne(@PathVariable Long id, Authentication authentication) {
        Cronograma cronograma = svc.getOne(id, authentication);
        return convertirADTO(cronograma);
    }

    /** POST /api/cronogramas - Crea un nuevo cronograma para el usuario autenticado */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CronogramaDTO create(@RequestBody CrearCronogramaDTO dto, Authentication authentication) {
        Cronograma cronograma = svc.crearDesdeDTO(dto, authentication);
        return convertirADTO(cronograma);
    }

    /** PUT /api/cronogramas/{id} - Actualiza un cronograma del usuario autenticado */
    @PutMapping("/{id}")
    public CronogramaDTO update(@PathVariable Long id,
                             @RequestBody CrearCronogramaDTO dto,
                             Authentication authentication) {
        // Verificar que el cronograma pertenezca al usuario antes de actualizar
        svc.getOne(id, authentication);
        // Eliminar el cronograma existente y crear uno nuevo con los nuevos datos
        svc.delete(id, authentication);
        Cronograma cronograma = svc.crearDesdeDTO(dto, authentication);
        return convertirADTO(cronograma);
    }

    /** DELETE /api/cronogramas/{id} - Elimina un cronograma del usuario autenticado */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        svc.delete(id, authentication);
    }

    /** Convierte una entidad Cronograma a DTO */
    private CronogramaDTO convertirADTO(Cronograma c) {
        CronogramaDTO dto = new CronogramaDTO();
        dto.setId(c.getId().intValue());
        dto.setNombre(c.getNombre());
        dto.setFechaCreacion(c.getFechaCreacion() != null ? 
                java.time.LocalDateTime.ofInstant(c.getFechaCreacion(), java.time.ZoneId.systemDefault()) : null);
        dto.setUsuarioId(c.getUsuario().getId());
        
        if (c.getDetalles() != null) {
            dto.setDetalles(c.getDetalles().stream()
                    .map(this::convertirDetalleADTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    /** Convierte una entidad DetalleCronograma a DTO */
    private com.cruma.dto.DetalleCronogramaDTO convertirDetalleADTO(DetalleCronograma detalle) {
        com.cruma.dto.DetalleCronogramaDTO dto = new com.cruma.dto.DetalleCronogramaDTO();
        dto.setId(detalle.getId().intValue());
        dto.setCronogramaId(detalle.getCronograma().getId().intValue());
        dto.setComisionMateriaHorarioId(detalle.getComisionMateriaHorario().getId());
        dto.setEstado(detalle.getEstado().name());
        
        // Extraer información adicional del ComisionMateriaHorario
        var cmh = detalle.getComisionMateriaHorario();
        var cm = cmh.getComisionMateria();
        var horario = cmh.getHorario();
        
        dto.setMateriaId(cm.getMateria().getId());
        dto.setComisionId(cm.getComision().getId());
        
        // Convertir nombre de día a número
        String diaNombre = horario.getDiaSemana().toUpperCase();
        String diaNumero = convertirDiaANumero(diaNombre);
        dto.setDia(diaNumero);
        
        dto.setHoraEntrada(horario.getHoraInicio().toString());
        dto.setHoraSalida(horario.getHoraFin().toString());
        
        return dto;
    }

    /** Convierte nombre de día a número (LUNES -> "1", MARTES -> "2", etc.) */
    private String convertirDiaANumero(String diaNombre) {
        return switch (diaNombre.toUpperCase()) {
            case "LUNES" -> "1";
            case "MARTES" -> "2";
            case "MIÉRCOLES", "MIERCOLES" -> "3";
            case "JUEVES" -> "4";
            case "VIERNES" -> "5";
            case "SÁBADO", "SABADO" -> "6";
            default -> diaNombre;
        };
    }
}
