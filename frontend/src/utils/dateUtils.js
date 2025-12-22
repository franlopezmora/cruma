/**
 * Utilidades para conversión de días de la semana
 */

const DIAS_NOMBRES = ['', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const DIAS_NOMBRES_CORTO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Convierte un número de día (1-6) a nombre completo en mayúsculas
 * @param {string|number} diaNum - Número del día como string o número
 * @returns {string} Nombre del día en mayúsculas
 */
export const convertirDiaANombre = (diaNum) => {
  const num = typeof diaNum === 'string' ? parseInt(diaNum, 10) : diaNum;
  if (num >= 1 && num <= 6) {
    return DIAS_NOMBRES[num];
  }
  // Si ya viene como nombre, devolverlo en mayúsculas
  if (typeof diaNum === 'string') {
    return diaNum.toUpperCase();
  }
  return null;
};

/**
 * Convierte un nombre de día a número (1-6)
 * @param {string} diaNombre - Nombre del día
 * @returns {string} Número del día como string
 */
export const convertirNombreADia = (diaNombre) => {
  // Si es null, undefined o vacío, devolver null
  if (!diaNombre || diaNombre === 'null' || diaNombre === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('convertirNombreADia: día vacío o null', diaNombre);
    }
    return null;
  }
  
  const diaStr = String(diaNombre).trim();
  
  // Si ya es un número, devolverlo como string
  if (/^\d+$/.test(diaStr)) {
    return diaStr;
  }
  
  // Convertir nombre a número
  const nombreUpper = diaStr.toUpperCase();
  const index = DIAS_NOMBRES.findIndex(d => d === nombreUpper);
  
  if (index > 0) {
    return index.toString();
  }
  
  // Si no se encontró, intentar con variaciones comunes
  const variaciones = {
    'LUN': 'LUNES',
    'MAR': 'MARTES',
    'MIE': 'MIÉRCOLES',
    'MIER': 'MIÉRCOLES',
    'MIERCOLES': 'MIÉRCOLES',
    'JUE': 'JUEVES',
    'VIE': 'VIERNES',
    'SAB': 'SÁBADO',
    'SABADO': 'SÁBADO'
  };
  
  const variacion = variaciones[nombreUpper];
  if (variacion) {
    const indexVariacion = DIAS_NOMBRES.findIndex(d => d === variacion);
    if (indexVariacion > 0) {
      return indexVariacion.toString();
    }
  }
  
  // Si no se encontró, devolver null para que se detecte el error
  if (process.env.NODE_ENV === 'development') {
    console.warn('convertirNombreADia: día no reconocido', {
      diaNombre,
      diaStr,
      nombreUpper,
      DIAS_NOMBRES
    });
  }
  return null;
};

/**
 * Obtiene el nombre corto del día
 * @param {string|number} diaNum - Número del día
 * @returns {string} Nombre corto del día
 */
export const obtenerDiaCorto = (diaNum) => {
  const num = typeof diaNum === 'string' ? parseInt(diaNum, 10) : diaNum;
  if (num >= 1 && num <= 6) {
    return DIAS_NOMBRES_CORTO[num];
  }
  return '';
};

/**
 * Obtiene el nombre completo del día en formato legible
 * @param {string|number} diaNum - Número del día
 * @returns {string} Nombre del día con primera letra mayúscula
 */
export const obtenerDiaNombre = (diaNum) => {
  const nombre = convertirDiaANombre(diaNum);
  if (nombre) {
    return nombre.charAt(0) + nombre.slice(1).toLowerCase();
  }
  return '';
};

