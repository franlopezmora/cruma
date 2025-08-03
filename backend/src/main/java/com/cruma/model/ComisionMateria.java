package com.cruma.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "comision_materia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComisionMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comision_id", nullable = false)
    private Comision comision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id", nullable = false)
    private Periodo periodo;

    @OneToMany(mappedBy = "comisionMateria", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComisionMateriaHorario> comisionMateriaHorarios;
}
