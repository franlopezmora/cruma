import { useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook personalizado para manejo consistente de errores
 */
export function useErrorHandler() {
  const handleError = useCallback((error, context = '') => {
    const errorMessage = error.response?.data?.error 
      || error.message 
      || 'Ha ocurrido un error inesperado';
    
    logger.error(`[${context}]`, errorMessage, error);
    
    return errorMessage;
  }, []);

  const handleApiError = useCallback((error, defaultMessage = 'Error al procesar la solicitud') => {
    const message = handleError(error, 'API');
    
    // Retornar mensaje para que el componente decida cómo mostrarlo
    return message || defaultMessage;
  }, [handleError]);

  return {
    handleError,
    handleApiError
  };
}

