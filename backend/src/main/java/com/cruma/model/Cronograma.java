//package com.cruma.model;
//
//import jakarta.persistence.*;
//import java.time.Instant;
//import java.util.List;
//import java.util.UUID;
//
//@Entity
//@Table(name = "cronograma")
//public class Cronograma {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, length = 255)
//    private String nombre;
//
//    /**
//     * Esta columna la inicializa la BD con DEFAULT now(),
//     * por eso la marcamos insertable=false.
//     */
//    @Column(name = "fecha_creacion", nullable = false, updatable = false, insertable = false)
//    private Instant fechaCreacion;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "usuario_id", nullable = false)
//    private Usuario usuario;
//
//    @OneToMany(
//            mappedBy = "cronograma",
//            cascade = CascadeType.ALL,
//            orphanRemoval = true
//    )
//    private List<DetalleCronograma> detalles;
//
//    // Constructores
//    public Cronograma() {}
//
//    // Getters & Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public String getNombre() { return nombre; }
//    public void setNombre(String nombre) { this.nombre = nombre; }
//
//    public Instant getFechaCreacion() { return fechaCreacion; }
//
//    public Usuario getUsuario() { return usuario; }
//    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
//
//    public List<DetalleCronograma> getDetalles() { return detalles; }
//    public void setDetalles(List<DetalleCronograma> detalles) {
//        this.detalles = detalles;
//    }
//}
