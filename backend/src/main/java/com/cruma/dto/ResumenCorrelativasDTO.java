package com.cruma.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumenCorrelativasDTO {
    private int bloqueadas;
    private int habilitadas;
    private int regulares;
    private int aprobadas;
    private int total;
}

