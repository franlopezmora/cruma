package com.cruma.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(nullable = false, unique = true, length = 255)
    private String mail;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<UsuarioProveedor> proveedores = new ArrayList<>();

    public Usuario() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public List<UsuarioProveedor> getProveedores() {
        return proveedores;
    }

    public void setProveedores(List<UsuarioProveedor> proveedores) {
        this.proveedores = proveedores;
    }

    /**
     * Agrega un proveedor OAuth si no existe ya.
     * Funciona tanto para usuarios nuevos (id null) como existentes.
     */
    public void agregarProveedor(String proveedor) {
        boolean existe = proveedores.stream()
                .anyMatch(up -> up.getProveedor().equals(proveedor));
        if (!existe) {
            UsuarioProveedor usuarioProveedor = new UsuarioProveedor();
            usuarioProveedor.setProveedor(proveedor);
            usuarioProveedor.setUsuario(this);
            // El usuarioId se establecerá automáticamente cuando se guarde el Usuario
            if (this.id != null) {
                usuarioProveedor.setUsuarioId(this.id);
            }
            proveedores.add(usuarioProveedor);
        }
    }
}