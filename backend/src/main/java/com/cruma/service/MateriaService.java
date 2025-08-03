package com.cruma.service;

import com.cruma.dto.MateriaDTO;
import com.cruma.model.Materia;
import com.cruma.repository.ComisionMateriaRepository;
import com.cruma.repository.MateriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepo;
    private final ComisionMateriaRepository cmRepo;

    public MateriaService(MateriaRepository materiaRepo,
                          ComisionMateriaRepository cmRepo) {
        this.materiaRepo  = materiaRepo;
        this.cmRepo       = cmRepo;
    }

    public List<MateriaDTO> listarTodas() {
        return materiaRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MateriaDTO> listarPorCarreraId(Integer carreraId) {
        return cmRepo.findDistinctMateriaByCarreraId(carreraId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MateriaDTO> listarPorCarreraYPeriodo(Integer carreraId, Integer periodoId) {
        return cmRepo.findDistinctMateriaByCarreraIdAndPeriodoId(carreraId, periodoId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private MateriaDTO toDto(Materia m) {
        return new MateriaDTO(
                m.getId(),
                m.getCodigo(),
                m.getNombre(),
                m.getAnioCarrera(),
                m.getElectiva()
        );
    }

    public List<MateriaDTO> listarPorIds(List<Integer> ids) {
        return materiaRepo.findAllById(ids).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}