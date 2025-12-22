package com.cruma.dto;

import lombok.Data;

@Data
public class BloqueCronogramaDTO {
    private Integer materiaId;
    private Integer comisionId;
    private String dia; // "1" para lunes, "2" para martes, etc.
    private String horaEntrada; // "08:00"
    private String horaSalida; // "09:30"
}


