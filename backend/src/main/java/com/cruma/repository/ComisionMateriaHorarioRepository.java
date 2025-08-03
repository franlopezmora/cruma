package com.cruma.repository;

import com.cruma.model.ComisionMateriaHorario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComisionMateriaHorarioRepository extends JpaRepository<ComisionMateriaHorario, Integer> {

    @Query("""
      SELECT cmh
      FROM ComisionMateriaHorario cmh
      WHERE cmh.comisionMateria.materia.id    = :materiaId
        AND cmh.comisionMateria.comision.id  = :comisionId
        AND cmh.comisionMateria.periodo.id   = :periodoId
    """)
    List<ComisionMateriaHorario> findByMateriaComisionPeriodo(
            @Param("materiaId") Integer materiaId,
            @Param("comisionId") Integer comisionId,
            @Param("periodoId") Integer periodoId
    );
}
