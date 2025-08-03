package com.cruma.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "materia")
@Data @NoArgsConstructor @AllArgsConstructor
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(length = 255, nullable = false)
    private String nombre;

    @Column(name = "anio_carrera", nullable = false)
    private Short anioCarrera;

    @Column(nullable = false)
    private Boolean electiva;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComisionMateria> comisionMaterias;
}