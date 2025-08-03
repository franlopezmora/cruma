package com.cruma.controller;

import com.cruma.dto.CarreraDTO;
import com.cruma.service.CarreraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
@CrossOrigin("http://localhost:5173")
public class CarreraController {

    private final CarreraService service;

    public CarreraController(CarreraService service) {
        this.service = service;
    }

    @GetMapping
    public List<CarreraDTO> getAll() {
        return service.listarTodas();
    }
}