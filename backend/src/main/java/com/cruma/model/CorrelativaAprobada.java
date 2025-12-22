package com.cruma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "correlativa_aprobada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorrelativaAprobada {

    @EmbeddedId
    private CorrelativaAprobadaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materiaId")
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materiaAprobadaId")
    @JoinColumn(name = "materia_aprobada_id", nullable = false)
    private Materia requerida;
}
