package com.cruma.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comision_materia_horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComisionMateriaHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comision_materia_id", nullable = false)
    private ComisionMateria comisionMateria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_id", nullable = false)
    private Horario horario;

    @OneToMany(mappedBy = "comisionMateriaHorario", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<DetalleCronograma> detalleCronograma;
}