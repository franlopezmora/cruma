package com.cruma.controller;

import com.cruma.dto.MateriaDTO;
import com.cruma.service.MateriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
@CrossOrigin("http://localhost:5173")
public class MateriaController {

    private final MateriaService service;

    public MateriaController(MateriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<MateriaDTO> getMaterias(
            @RequestParam(value = "carreraId", required = false) Integer carreraId) {
        if (carreraId != null) {
            return service.listarPorCarreraId(carreraId);
        }
        return service.listarTodas();
    }

    @GetMapping("/filtrar")
    public List<MateriaDTO> filtrarPorCarreraYPeriodo(
            @RequestParam Integer carreraId,
            @RequestParam Integer periodoId) {
        return service.listarPorCarreraYPeriodo(carreraId, periodoId);
    }

    @GetMapping("/seleccionadas")
    public List<MateriaDTO> getMateriasSeleccionadas(@RequestParam List<Integer> ids) {
        return service.listarPorIds(ids);
    }
}