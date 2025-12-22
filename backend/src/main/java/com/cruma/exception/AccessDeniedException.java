package com.cruma.exception;

/**
 * Excepción lanzada cuando un usuario intenta acceder a un recurso que no le pertenece.
 */
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}

