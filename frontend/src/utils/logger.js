/**
 * Utilidad de logging que solo loguea en desarrollo
 * y formatea mensajes consistentemente
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args);
  }
};

