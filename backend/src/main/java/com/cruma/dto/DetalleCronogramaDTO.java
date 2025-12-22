package com.cruma.dto;

import lombok.Data;

@Data
public class DetalleCronogramaDTO {
    private Integer id;
    private Integer cronogramaId;
    private Integer comisionMateriaHorarioId;
    private String estado;
    // Información adicional para facilitar la reconstrucción en el frontend
    private Integer materiaId;
    private Integer comisionId;
    private String dia; // "1" para lunes, "2" para martes, etc.
    private String horaEntrada; // "08:00"
    private String horaSalida; // "09:30"
}