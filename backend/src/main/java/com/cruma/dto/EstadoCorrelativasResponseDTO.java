package com.cruma.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoCorrelativasResponseDTO {
    private Instant ultimaActualizacion;
    private List<MateriaEstadoDTO> estados;
    private ResumenCorrelativasDTO resumen;
}

