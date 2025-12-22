package com.cruma.repository;

import com.cruma.model.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {
    /** Busca todos los cronogramas de un usuario dado */
    List<Cronograma> findByUsuarioId(UUID usuarioId);
}
