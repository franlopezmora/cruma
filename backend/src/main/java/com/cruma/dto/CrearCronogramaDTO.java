package com.cruma.dto;

import lombok.Data;
import java.util.List;

@Data
public class CrearCronogramaDTO {
    private String nombre;
    private Integer periodoId; // Cuatrimestre (0 o 1)
    private List<BloqueCronogramaDTO> bloques;
}


