package com.cruma.controller;

import com.cruma.dto.EstadoCorrelativasResponseDTO;
import com.cruma.dto.MateriaEstadoDTO;
import com.cruma.service.EstadoCorrelativasService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/correlativas/estado")
@CrossOrigin("http://localhost:5173")
public class EstadoCorrelativasController {

    private final EstadoCorrelativasService service;

    public EstadoCorrelativasController(EstadoCorrelativasService service) {
        this.service = service;
    }

    @GetMapping
    public EstadoCorrelativasResponseDTO obtener(Authentication authentication) {
        return service.obtener(authentication);
    }

    @PutMapping
    public EstadoCorrelativasResponseDTO guardar(@RequestBody List<MateriaEstadoDTO> estados,
                                                 Authentication authentication) {
        return service.guardar(estados, authentication);
    }
}

