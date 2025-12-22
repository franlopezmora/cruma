package com.cruma.exception;

/**
 * Excepción lanzada cuando un usuario intenta crear más cronogramas de los permitidos.
 */
public class LimiteCronogramasExcedidoException extends RuntimeException {
    public LimiteCronogramasExcedidoException(String message) {
        super(message);
    }
    
    public LimiteCronogramasExcedidoException(int limite, int actual) {
        super(String.format("Has alcanzado el límite de %d cronogramas. Actualmente tienes %d cronogramas guardados.", limite, actual));
    }
}





