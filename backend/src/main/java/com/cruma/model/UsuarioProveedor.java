package com.cruma.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "usuario_proveedor")
@IdClass(UsuarioProveedorId.class)
public class UsuarioProveedor {

    @Id
    @Column(name = "usuario_id", columnDefinition = "uuid")
    private UUID usuarioId;

    @Id
    @Column(name = "proveedor", length = 50)
    private String proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    @JsonIgnore // Evitar referencia circular al serializar a JSON
    private Usuario usuario;

    public UsuarioProveedor() {
    }

    public UsuarioProveedor(UUID usuarioId, String proveedor) {
        this.usuarioId = usuarioId;
        this.proveedor = proveedor;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}

