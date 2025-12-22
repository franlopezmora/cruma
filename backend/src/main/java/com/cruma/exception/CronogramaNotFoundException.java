package com.cruma.exception;

/**
 * Excepción lanzada cuando no se encuentra un cronograma.
 */
public class CronogramaNotFoundException extends RuntimeException {
    public CronogramaNotFoundException(String message) {
        super(message);
    }
    
    public CronogramaNotFoundException(Long id) {
        super("Cronograma no encontrado: " + id);
    }
}

