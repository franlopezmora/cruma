package com.cruma.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CronogramaDTO {
    private Integer id;
    private String nombre;
    private LocalDateTime fechaCreacion;
    private UUID usuarioId;
    private List<DetalleCronogramaDTO> detalles;
}
