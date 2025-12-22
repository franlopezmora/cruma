package com.cruma.model;

import java.io.Serializable;
import java.util.UUID;
import java.util.Objects;

public class UsuarioProveedorId implements Serializable {
    private UUID usuarioId;
    private String proveedor;

    public UsuarioProveedorId() {
    }

    public UsuarioProveedorId(UUID usuarioId, String proveedor) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UsuarioProveedorId that = (UsuarioProveedorId) o;
        return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(proveedor, that.proveedor);
    }

    @Override
    public int hashCode() {
        return Objects.hash(usuarioId, proveedor);
    }
}




