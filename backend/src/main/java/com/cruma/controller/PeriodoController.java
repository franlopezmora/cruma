package com.cruma.controller;

import com.cruma.dto.PeriodoDTO;
import com.cruma.service.PeriodoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/periodos")
@CrossOrigin("http://localhost:5173")  // ajusta según tu front
public class PeriodoController {

    private final PeriodoService service;

    public PeriodoController(PeriodoService service) {
        this.service = service;
    }

    @GetMapping
    public List<PeriodoDTO> getAll() {
        return service.listarTodos();
    }
}