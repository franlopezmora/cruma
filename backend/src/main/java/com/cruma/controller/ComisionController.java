package com.cruma.controller;

import com.cruma.dto.ComisionDTO;
import com.cruma.dto.ComisionInfoDTO;
import com.cruma.dto.HorarioDTO;
import com.cruma.service.ComisionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin("http://localhost:5173")
public class ComisionController {

    private final ComisionService service;

    public ComisionController(ComisionService service) {
        this.service = service;
    }

//    @GetMapping("/materias/{materiaId}/comisiones")
//    public List<ComisionDTO> getComisionesDeMateria(
//            @PathVariable Integer materiaId,
//            @RequestParam Integer carreraId,
//            @RequestParam Integer periodoId) {
//
//        return service.listarPorMateriaCarreraPeriodo(materiaId, carreraId, periodoId);
//    }

    @GetMapping("/materias/{materiaId}/comisiones")
    public List<ComisionInfoDTO> getComisionesInfo(@PathVariable Integer materiaId) {
        return service.listarInfoPorMateria(materiaId);
    }

    @GetMapping("/materias/{materiaId}/comisiones/{comisionId}/periodo/{periodoId}/horarios")
    public List<HorarioDTO> getHorariosPorMateriaComisionPeriodo(
            @PathVariable Integer materiaId,
            @PathVariable Integer comisionId,
            @PathVariable Integer periodoId) {
        return service.listarHorariosPorMateriaComisionPeriodo(
                materiaId, comisionId, periodoId
        );
    }
}