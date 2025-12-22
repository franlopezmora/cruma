package com.cruma.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioMateriaEstadoId implements Serializable {

    @Column(name = "usuario_id", columnDefinition = "uuid")
    private UUID usuarioId;

    @Column(name = "materia_id")
    private Integer materiaId;
}

