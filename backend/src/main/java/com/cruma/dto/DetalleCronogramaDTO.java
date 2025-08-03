package com.cruma.dto;

import lombok.Data;

@Data
public class DetalleCronogramaDTO {
    private Integer id;
    private Integer cronogramaId;
    private Integer comisionMateriaHorarioId;
    private String estado;
}