package com.cruma.service;

import com.cruma.dto.CarreraDTO;
import com.cruma.repository.CarreraRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarreraService {

    private final CarreraRepository repo;

    public CarreraService(CarreraRepository repo) {
        this.repo = repo;
    }

    public List<CarreraDTO> listarTodas() {
        return repo.findAll().stream()
                .map(c -> new CarreraDTO(c.getId(), c.getCodigo(), c.getNombre()))
                .collect(Collectors.toList());
    }
}