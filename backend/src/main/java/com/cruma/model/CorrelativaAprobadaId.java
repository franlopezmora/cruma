package com.cruma.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorrelativaAprobadaId implements Serializable {
    @Column(name = "materia_id")
    private Integer materiaId;

    @Column(name = "materia_aprobada_id")
    private Integer materiaAprobadaId;
}
