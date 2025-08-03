package com.cruma.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class ComisionInfoDTO {
    private Integer comisionId;
    private Integer materiaId;
    private String seccion;
    private String carrera;
    private Integer periodo;
    private List<HorarioDTO> horarios;
}