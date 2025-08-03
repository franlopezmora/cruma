//package com.cruma.model;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name = "detalle_cronograma",
//        uniqueConstraints = @UniqueConstraint(
//                columnNames = {"cronograma_id","comision_materia_id"}
//        ))
//public class DetalleCronograma {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "cronograma_id", nullable = false)
//    private Cronograma cronograma;
//
//    @Column(nullable = false, length = 20)
//    private String estado = "PENDIENTE";
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(name = "comision_materia_id", nullable = false)
//    private ComisionMateria comisionMateria;
//
//    public DetalleCronograma() {}
//
//    public Long getId() { return id; }
//    public Cronograma getCronograma() { return cronograma; }
//    public void setCronograma(Cronograma cronograma) { this.cronograma = cronograma; }
//
//    public String getEstado() { return estado; }
//    public void setEstado(String estado) { this.estado = estado; }
//
//    public ComisionMateria getComisionMateria() { return comisionMateria; }
//    public void setComisionMateria(ComisionMateria cm) { this.comisionMateria = cm; }
//}
