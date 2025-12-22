package com.cruma.repository;

import com.cruma.model.CorrelativaAprobada;
import com.cruma.model.CorrelativaAprobadaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface CorrelativaAprobadaRepository extends JpaRepository<CorrelativaAprobada, CorrelativaAprobadaId> {
    List<CorrelativaAprobada> findByMateria_Id(Integer materiaId);

    List<CorrelativaAprobada> findByMateria_IdIn(List<Integer> materiaIds);

    @Query("SELECT c.requerida.id FROM CorrelativaAprobada c WHERE c.materia.id = :materiaId")
    List<Integer> findRequeridasIdsByMateriaId(@Param("materiaId") Integer materiaId);

    @Query("SELECT DISTINCT c.materia.id FROM CorrelativaAprobada c")
    Set<Integer> findDistinctMateriaIds();

    @Query("SELECT c.materia.id as materiaId, c.requerida.id as requeridaId FROM CorrelativaAprobada c WHERE c.materia.id IN :materiaIds")
    List<CorrelativaProjection> findPairsByMateriaIds(@Param("materiaIds") List<Integer> materiaIds);

    @Query("SELECT c.materia.id as materiaId, c.requerida.id as requeridaId FROM CorrelativaAprobada c")
    List<CorrelativaProjection> findPairsAll();
}
