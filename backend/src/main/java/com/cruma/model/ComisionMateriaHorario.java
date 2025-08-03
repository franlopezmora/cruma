package com.cruma.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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

//    @OneToMany( mappedBy = "comisionMateriaHorario", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<DetalleCronograma> detalleCronograma;
}