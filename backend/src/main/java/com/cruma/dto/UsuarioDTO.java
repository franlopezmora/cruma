package com.cruma.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UsuarioDTO {
    private UUID id;
    private String nombre;
    private String mail;
}
