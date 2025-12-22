package com.cruma.controller;

import com.cruma.dto.CorrelativasDTO;
import com.cruma.service.CorrelativasService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/correlativas")
@CrossOrigin("http://localhost:5173")
public class CorrelativasController {

    private final CorrelativasService service;

    public CorrelativasController(CorrelativasService service) {
        this.service = service;
    }

    @GetMapping
    public List<CorrelativasDTO> getAll() {
        return service.obtenerTodas();
    }

    @GetMapping("/batch")
    public List<CorrelativasDTO> getPorMaterias(@RequestParam List<Integer> materiaIds) {
        return service.obtenerPorMaterias(materiaIds);
    }

    @GetMapping("/{materiaId}")
    public CorrelativasDTO getPorMateria(@PathVariable Integer materiaId) {
        return service.obtenerPorMateria(materiaId);
    }
}
