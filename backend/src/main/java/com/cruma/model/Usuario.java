//package com.cruma.model;
//
//import jakarta.persistence.*;
//import java.time.Instant;
//import java.util.List;
//import java.util.UUID;
//
//@Entity
//@Table(name = "usuario")
//public class Usuario {
//    @Id
//    @Column(columnDefinition = "uuid")
//    private UUID id;
//
//    @Column(nullable = false, length = 255)
//    private String nombre;
//
//    @Column(nullable = false, unique = true, length = 255)
//    private String mail;
//
//    public Usuario() {}
//    public UUID getId() { return id; }
//    public void setId(UUID id) { this.id = id; }
//    public String getNombre() { return nombre; }
//    public void setNombre(String nombre) { this.nombre = nombre; }
//    public String getMail() { return mail; }
//    public void setMail(String mail) { this.mail = mail; }
//}