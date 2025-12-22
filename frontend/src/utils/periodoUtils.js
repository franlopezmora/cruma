/**
 * Utilidades para mapeo de periodos entre frontend y backend
 * 
 * Frontend usa: 0 = primer cuatrimestre, 1 = segundo cuatrimestre
 * Backend usa: 0 = ANUAL, 1 = CUAT1, 2 = CUAT2
 */

/**
 * Convierte el periodo del frontend (0 o 1) al periodoId real de la BD
 * @param {number} selectedCuatri - 0 para primer cuatrimestre, 1 para segundo
 * @returns {number} periodoId de la BD (1 = CUAT1, 2 = CUAT2, 0 = ANUAL si es null/undefined)
 */
export const mapearPeriodoFrontendABackend = (selectedCuatri) => {
  if (selectedCuatri === 0) return 1; // Primer cuatrimestre -> CUAT1
  if (selectedCuatri === 1) return 2; // Segundo cuatrimestre -> CUAT2
  return 0; // Fallback a ANUAL
};

/**
 * Convierte el periodoId de la BD al formato del frontend
 * @param {number} periodoId - ID del periodo en la BD (0 = ANUAL, 1 = CUAT1, 2 = CUAT2)
 * @returns {number} 0 para primer cuatrimestre, 1 para segundo, null para ANUAL
 */
export const mapearPeriodoBackendAFrontend = (periodoId) => {
  if (periodoId === 1) return 0; // CUAT1 -> primer cuatrimestre
  if (periodoId === 2) return 1; // CUAT2 -> segundo cuatrimestre
  return null; // ANUAL no tiene equivalente directo
};

