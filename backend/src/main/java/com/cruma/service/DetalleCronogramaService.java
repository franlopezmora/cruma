//package com.cruma.service;
//
//import com.cruma.model.DetalleCronograma;
//import com.cruma.repository.DetalleCronogramaRepository;
//import org.springframework.stereotype.Service;
//import java.util.List;
//
//@Service
//public class DetalleCronogramaService {
//
//    private final DetalleCronogramaRepository repo;
//
//    public DetalleCronogramaService(DetalleCronogramaRepository repo) {
//        this.repo = repo;
//    }
//
//    public List<DetalleCronograma> listByCronograma(Long cronogramaId) {
//        return repo.findByCronogramaId(cronogramaId);
//    }
//
//    public DetalleCronograma add(DetalleCronograma d) {
//        return repo.save(d);
//    }
//
//    public void remove(Long detalleId) {
//        repo.deleteById(detalleId);
//    }
//}
