package com.cruma.service;

import com.cruma.dto.ComisionDTO;
import com.cruma.dto.ComisionInfoDTO;
import com.cruma.dto.HorarioDTO;
import com.cruma.model.Comision;
import com.cruma.model.ComisionMateria;
import com.cruma.repository.ComisionMateriaHorarioRepository;
import com.cruma.repository.ComisionMateriaRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComisionService {

    private final ComisionMateriaRepository cmRepo;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("H:mm");
    private final ComisionMateriaHorarioRepository cmhRepo;

    public ComisionService(ComisionMateriaRepository cmRepo, ComisionMateriaHorarioRepository cmhRepo) {
        this.cmRepo = cmRepo;
        this.cmhRepo = cmhRepo;
    }

    public List<ComisionDTO> listarPorMateriaCarreraPeriodo(
            Integer materiaId, Integer carreraId, Integer periodoId) {

        return cmRepo
                .findDistinctComisionByMateriaAndCarreraAndPeriodo(materiaId, carreraId, periodoId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ComisionDTO toDto(Comision comision) {
        return new ComisionDTO(comision.getId(), comision.getSeccion());
    }

    public List<ComisionInfoDTO> listarInfoPorMateria(Integer materiaId) {
        List<ComisionMateria> cms = cmRepo.findByMateriaIdWithAll(materiaId);

        return cms.stream()
                .map(cm -> {
                    Comision c = cm.getComision();
                    // iteramos sobre COMISION_MATERIA_HORARIO, no sobre un campo directo de horarios
                    List<HorarioDTO> hs = Optional.ofNullable(cm.getComisionMateriaHorarios())
                            .orElse(List.of())
                            .stream()
                            .map(cmh -> {
                                var h = cmh.getHorario();
                                return new HorarioDTO(
                                        h.getDiaSemana(),
                                        h.getHoraInicio().format(TIME_FMT),
                                        h.getHoraFin().format(TIME_FMT)
                                );
                            })
                            .collect(Collectors.toList());

                    Integer periodo = cm.getPeriodo().getId();

                    return new ComisionInfoDTO(
                            c.getId(),
                            cm.getMateria().getId(),
                            c.getSeccion(),
                            c.getCarrera().getNombre(),
                            periodo,
                            hs
                    );
                })
                .collect(Collectors.toList());
    }

    public List<HorarioDTO> listarHorariosPorMateriaComisionPeriodo(
            Integer materiaId,
            Integer comisionId,
            Integer periodoId
    ) {
        return cmhRepo
                .findByMateriaComisionPeriodo(materiaId, comisionId, periodoId)
                .stream()
                .map(cmh -> {
                    var h = cmh.getHorario();
                    return new HorarioDTO(
                            h.getDiaSemana(),
                            h.getHoraInicio().format(TIME_FMT),
                            h.getHoraFin().format(TIME_FMT)
                    );
                })
                .collect(Collectors.toList());
    }

}