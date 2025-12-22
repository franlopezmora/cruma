package com.cruma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "usuario_materia_estado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioMateriaEstado {

    @EmbeddedId
    private UsuarioMateriaEstadoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materiaId")
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    /**
     * Estados compatibles con el frontend:
     * 0 = bloqueada / pendiente, 1 = habilitada, 2 = regular, 3 = aprobada.
     */
    @Column(nullable = false)
    private Short estado;

    @Column(name = "updated_at", nullable = false, columnDefinition = "timestamp with time zone")
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void touchTimestamp() {
        this.updatedAt = Instant.now();
    }
}

