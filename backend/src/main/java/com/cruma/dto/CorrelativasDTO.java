package com.cruma.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CorrelativasDTO {
    private Integer materiaId;
    private List<Integer> requiereRegularIds;
    private List<Integer> requiereAprobadaIds;
}
