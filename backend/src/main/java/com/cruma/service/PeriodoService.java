package com.cruma.service;

import com.cruma.dto.PeriodoDTO;
import com.cruma.repository.PeriodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PeriodoService {

    private final PeriodoRepository repo;

    public PeriodoService(PeriodoRepository repo) {
        this.repo = repo;
    }

    public List<PeriodoDTO> listarTodos() {
        return repo.findAll().stream()
                .map(p -> new PeriodoDTO(
                        p.getId(),
                        p.getCodigo(),
                        p.getDescripcion()
                ))
                .collect(Collectors.toList());
    }
}