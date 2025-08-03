//package com.cruma.service;
//
//import com.cruma.model.Cronograma;
//import com.cruma.repository.CronogramaRepository;
//import org.springframework.stereotype.Service;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class CronogramaService {
//
//    private final CronogramaRepository repo;
//
//    public CronogramaService(CronogramaRepository repo) {
//        this.repo = repo;
//    }
//
//    /** Crea o actualiza un cronograma */
//    public Cronograma save(Cronograma c) {
//        return repo.save(c);
//    }
//
//    /** Lista todos los cronogramas de un usuario */
//    public List<Cronograma> listByUsuario(UUID usuarioId) {
//        return repo.findByUsuarioId(usuarioId);
//    }
//
//    /** Elimina un cronograma por su id */
//    public void delete(Long id) {
//        repo.deleteById(id);
//    }
//
//    /** Obtiene uno solo, o lanza excepción si no existe */
//    public Cronograma getOne(Long id) {
//        return repo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Cronograma no encontrado: " + id));
//    }
//}
