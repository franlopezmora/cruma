package com.cruma.repository;

import com.cruma.model.Comision;
import com.cruma.model.ComisionMateria;
import com.cruma.model.Materia;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComisionMateriaRepository extends JpaRepository<ComisionMateria, Integer> {

    @Query("""
      SELECT DISTINCT cm.materia
      FROM ComisionMateria cm
      WHERE cm.comision.carrera.id = :carreraId
    """)
    List<Materia> findDistinctMateriaByCarreraId(@Param("carreraId") Integer carreraId);

    @Query("""
      SELECT DISTINCT cm.materia
      FROM ComisionMateria cm
      WHERE cm.comision.carrera.id = :carreraId
        AND cm.periodo.id = :periodoId
    """)
    List<Materia> findDistinctMateriaByCarreraIdAndPeriodoId(
            @Param("carreraId") Integer carreraId,
            @Param("periodoId") Integer periodoId
    );

    @Query("""
      SELECT DISTINCT cm.comision
      FROM ComisionMateria cm
      WHERE cm.materia.id   = :materiaId
        AND cm.comision.carrera.id = :carreraId
        AND cm.periodo.id    = :periodoId
    """)
    List<Comision> findDistinctComisionByMateriaAndCarreraAndPeriodo(
            @Param("materiaId") Integer materiaId,
            @Param("carreraId") Integer carreraId,
            @Param("periodoId") Integer periodoId
    );

    @Query("""
      SELECT cm
      FROM ComisionMateria cm
      JOIN FETCH cm.comision c
      JOIN FETCH c.carrera
      JOIN FETCH cm.periodo
      LEFT JOIN FETCH cm.comisionMateriaHorarios cmh
      LEFT JOIN FETCH cmh.horario
      WHERE cm.materia.id = :materiaId
    """)
    List<ComisionMateria> findByMateriaIdWithAll(@Param("materiaId") Integer materiaId);
}