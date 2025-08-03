package com.cruma.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "periodo")
@Data @NoArgsConstructor @AllArgsConstructor
public class Periodo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 10, nullable = false, unique = true)
    private String codigo;

    @Column(length = 255, nullable = false)
    private String descripcion;

    @OneToMany(mappedBy = "periodo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComisionMateria> comisionMaterias;
}