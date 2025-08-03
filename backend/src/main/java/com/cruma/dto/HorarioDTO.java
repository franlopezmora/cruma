package com.cruma.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class HorarioDTO {
    private String dia;
    private String horaEntrada;
    private String horaSalida;
}