package com.cruma.service;

import com.cruma.dto.CorrelativasDTO;
import com.cruma.repository.CorrelativaAprobadaRepository;
import com.cruma.repository.CorrelativaRegularRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CorrelativasService {

    private final CorrelativaRegularRepository regRepo;
    private final CorrelativaAprobadaRepository aproRepo;

    public CorrelativasService(CorrelativaRegularRepository regRepo,
            CorrelativaAprobadaRepository aproRepo) {
        this.regRepo = regRepo;
        this.aproRepo = aproRepo;
    }

    public CorrelativasDTO obtenerPorMateria(Integer materiaId) {
        var reg = regRepo.findRequeridasIdsByMateriaId(materiaId);
        var apro = aproRepo.findRequeridasIdsByMateriaId(materiaId);
        return new CorrelativasDTO(materiaId, reg, apro);
    }

    public List<CorrelativasDTO> obtenerPorMaterias(List<Integer> materiaIds) {
        Map<Integer, CorrelativasDTO> map = initMap(materiaIds);

        regRepo.findPairsByMateriaIds(materiaIds)
                .forEach(p -> map.get(p.getMateriaId()).getRequiereRegularIds().add(p.getRequeridaId()));

        aproRepo.findPairsByMateriaIds(materiaIds)
                .forEach(p -> map.get(p.getMateriaId()).getRequiereAprobadaIds().add(p.getRequeridaId()));

        return new ArrayList<>(map.values());
    }

    // ✅ NUEVO: ALL
    public List<CorrelativasDTO> obtenerTodas() {
        // Importante: acá construimos el set de materiaIds desde ambas tablas
        Set<Integer> materiaIds = new HashSet<>();
        materiaIds.addAll(regRepo.findDistinctMateriaIds());
        materiaIds.addAll(aproRepo.findDistinctMateriaIds());

        Map<Integer, CorrelativasDTO> map = initMap(new ArrayList<>(materiaIds));

        regRepo.findPairsAll().forEach(p -> map.get(p.getMateriaId()).getRequiereRegularIds().add(p.getRequeridaId()));

        aproRepo.findPairsAll()
                .forEach(p -> map.get(p.getMateriaId()).getRequiereAprobadaIds().add(p.getRequeridaId()));

        return new ArrayList<>(map.values());
    }

    private Map<Integer, CorrelativasDTO> initMap(List<Integer> materiaIds) {
        Map<Integer, CorrelativasDTO> map = new HashMap<>();
        for (Integer id : materiaIds) {
            map.put(id, new CorrelativasDTO(id, new ArrayList<>(), new ArrayList<>()));
        }
        return map;
    }
}
