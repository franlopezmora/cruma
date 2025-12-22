package com.cruma.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "detalle_cronograma")
public class DetalleCronograma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cronograma_id", nullable = false)
    private Cronograma cronograma;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "detalle_estado_enum")
    private DetalleEstadoEnum estado = DetalleEstadoEnum.SELECCIONABLE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comision_materia_horario_id", nullable = false)
    private ComisionMateriaHorario comisionMateriaHorario;

    public DetalleCronograma() {
    }

    public Long getId() {
        return id;
    }

    public Cronograma getCronograma() {
        return cronograma;
    }

    public void setCronograma(Cronograma cronograma) {
        this.cronograma = cronograma;
    }

    public DetalleEstadoEnum getEstado() {
        return estado;
    }

    public void setEstado(DetalleEstadoEnum estado) {
        this.estado = estado;
    }

    public ComisionMateriaHorario getComisionMateriaHorario() {
        return comisionMateriaHorario;
    }

    public void setComisionMateriaHorario(ComisionMateriaHorario comisionMateriaHorario) {
        this.comisionMateriaHorario = comisionMateriaHorario;
    }
}
