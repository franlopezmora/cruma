package com.cruma.repository;

import com.cruma.model.UsuarioMateriaEstado;
import com.cruma.model.UsuarioMateriaEstadoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UsuarioMateriaEstadoRepository extends JpaRepository<UsuarioMateriaEstado, UsuarioMateriaEstadoId> {

    List<UsuarioMateriaEstado> findByUsuario_Id(UUID usuarioId);

    void deleteByUsuario_Id(UUID usuarioId);
}

