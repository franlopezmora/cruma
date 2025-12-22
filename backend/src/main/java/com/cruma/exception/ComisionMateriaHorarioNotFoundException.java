package com.cruma.exception;

/**
 * Excepción lanzada cuando no se encuentra un ComisionMateriaHorario.
 */
public class ComisionMateriaHorarioNotFoundException extends RuntimeException {
    public ComisionMateriaHorarioNotFoundException(String message) {
        super(message);
    }
}

