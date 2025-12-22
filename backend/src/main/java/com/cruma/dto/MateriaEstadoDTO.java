package com.cruma.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MateriaEstadoDTO {
    private Integer materiaId;
    /**
     * 0 = bloqueada / pendiente, 1 = habilitada, 2 = regular, 3 = aprobada.
     */
    private Integer estado;
}

