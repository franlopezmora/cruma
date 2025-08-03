package com.cruma.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MateriaDTO {
    private Integer id;
    private String codigo;
    private String nombre;
    private Short anioCarrera;
    private Boolean electiva;
}