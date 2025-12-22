package com.cruma.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "correlativa_regular")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorrelativaRegular {

    @EmbeddedId
    private CorrelativaRegularId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materiaId")
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("materiaRegularId")
    @JoinColumn(name = "materia_regular_id", nullable = false)
    private Materia requerida;
}
