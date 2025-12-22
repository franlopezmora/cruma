/**
 * Utilidades para manejar localStorage de forma consistente
 * Incluye validación de datos y manejo de errores
 */

// Claves para localStorage
export const STORAGE_KEYS = {
  CARRERA_SELECTED: 'cruma_carrera_selected',
  CUATRIMESTRE_SELECTED: 'cruma_cuatrimestre_selected',
  MATERIAS_SELECTED: 'cruma_materias_selected',
  CRONOGRAMA_FIXED: 'cruma_cronograma_fixed',
  USER_PREFERENCES: 'cruma_user_preferences',
  CORRELATIVAS_ESTADO: 'cruma_correlativas_estado',
  CORRELATIVAS_CUATRI: 'cruma_correlativas_cuatri'
};

/**
 * Guarda datos en localStorage con validación
 * @param {string} key - Clave del localStorage
 * @param {any} data - Datos a guardar
 * @param {number} maxAge - Tiempo de expiración en milisegundos (opcional)
 */
export const saveToStorage = (key, data, maxAge = null) => {
  try {
    const storageData = {
      data,
      timestamp: Date.now(),
      maxAge: maxAge || (30 * 24 * 60 * 60 * 1000) // 30 días por defecto
    };
    
    localStorage.setItem(key, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error(`Error guardando en localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Recupera datos del localStorage con validación de expiración
 * @param {string} key - Clave del localStorage
 * @param {any} defaultValue - Valor por defecto si no existe o expiró
 * @returns {any} Datos recuperados o valor por defecto
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);
    
    // Verificar si los datos han expirado
    if (parsed.maxAge && (Date.now() - parsed.timestamp) > parsed.maxAge) {
      localStorage.removeItem(key);
      return defaultValue;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Error recuperando de localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Elimina datos específicos del localStorage
 * @param {string} key - Clave a eliminar
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error eliminando de localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Limpia todos los datos de la aplicación del localStorage
 * Incluye datos de ambos cuatrimestres
 */
export const clearAllAppData = () => {
  try {
    // Limpiar claves principales
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Limpiar datos de cuatrimestres (1 y 2)
    [1, 2].forEach(cuatri => {
      localStorage.removeItem(`${STORAGE_KEYS.MATERIAS_SELECTED}_cuatri${cuatri}`);
      localStorage.removeItem(`${STORAGE_KEYS.CRONOGRAMA_FIXED}_cuatri${cuatri}`);
    });
    
    // Limpiar correlativas
    localStorage.removeItem(STORAGE_KEYS.CORRELATIVAS_ESTADO);
    localStorage.removeItem(STORAGE_KEYS.CORRELATIVAS_CUATRI);
    
    return true;
  } catch (error) {
    console.error('Error limpiando datos de la aplicación:', error);
    return false;
  }
};

/**
 * Obtiene información sobre el uso del localStorage
 * @returns {object} Información de uso
 */
export const getStorageInfo = () => {
  try {
    const info = {
      totalKeys: 0,
      appKeys: 0,
      totalSize: 0,
      appSize: 0,
      keys: []
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      
      info.totalKeys++;
      info.totalSize += size;
      info.keys.push({ key, size });
      
      if (Object.values(STORAGE_KEYS).includes(key)) {
        info.appKeys++;
        info.appSize += size;
      }
    }

    return info;
  } catch (error) {
    console.error('Error obteniendo información del localStorage:', error);
    return null;
  }
};

// Funciones específicas para cada tipo de dato

/**
 * Guarda la carrera seleccionada
 */
export const saveCarreraSelected = (carreraId) => {
  return saveToStorage(STORAGE_KEYS.CARRERA_SELECTED, carreraId);
};

/**
 * Recupera la carrera seleccionada
 */
export const getCarreraSelected = () => {
  const result = getFromStorage(STORAGE_KEYS.CARRERA_SELECTED, '');
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda el cuatrimestre seleccionado
 */
export const saveCuatrimestreSelected = (cuatrimestre) => {
  return saveToStorage(STORAGE_KEYS.CUATRIMESTRE_SELECTED, cuatrimestre);
};

/**
 * Recupera el cuatrimestre seleccionado
 */
export const getCuatrimestreSelected = () => {
  const result = getFromStorage(STORAGE_KEYS.CUATRIMESTRE_SELECTED, null);
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda las materias seleccionadas (separadas por cuatrimestre)
 * @param {Array<number>} materiaIds - IDs de las materias seleccionadas
 * @param {number} cuatrimestre - Cuatrimestre (1 o 2)
 */
export const saveMateriasSelected = (materiaIds, cuatrimestre = null) => {
  if (cuatrimestre === null) {
    // Compatibilidad: si no se especifica cuatrimestre, usar el guardado
    cuatrimestre = getCuatrimestreSelected();
  }
  
  if (cuatrimestre === null || (cuatrimestre !== 1 && cuatrimestre !== 2)) {
    // Si no hay cuatrimestre válido, usar la clave antigua para compatibilidad
    return saveToStorage(STORAGE_KEYS.MATERIAS_SELECTED, materiaIds);
  }
  
  const key = `${STORAGE_KEYS.MATERIAS_SELECTED}_cuatri${cuatrimestre}`;
  return saveToStorage(key, materiaIds);
};

/**
 * Recupera las materias seleccionadas (separadas por cuatrimestre)
 * @param {number} cuatrimestre - Cuatrimestre (1 o 2). Si es null, intenta usar el guardado
 */
export const getMateriasSelected = (cuatrimestre = null) => {
  if (cuatrimestre === null) {
    // Compatibilidad: si no se especifica cuatrimestre, usar el guardado
    cuatrimestre = getCuatrimestreSelected();
  }
  
  if (cuatrimestre === null || (cuatrimestre !== 1 && cuatrimestre !== 2)) {
    // Si no hay cuatrimestre válido, usar la clave antigua para compatibilidad
    const result = getFromStorage(STORAGE_KEYS.MATERIAS_SELECTED, []);
    return result && result.data !== undefined ? result.data : result;
  }
  
  const key = `${STORAGE_KEYS.MATERIAS_SELECTED}_cuatri${cuatrimestre}`;
  const result = getFromStorage(key, []);
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda los bloques fijados del cronograma (separados por cuatrimestre)
 * @param {Array} fixedBlocks - Bloques fijados del cronograma
 * @param {number} cuatrimestre - Cuatrimestre (1 o 2)
 */
export const saveCronogramaFixed = (fixedBlocks, cuatrimestre = null) => {
  if (cuatrimestre === null) {
    // Compatibilidad: si no se especifica cuatrimestre, usar el guardado
    cuatrimestre = getCuatrimestreSelected();
  }
  
  if (cuatrimestre === null || (cuatrimestre !== 1 && cuatrimestre !== 2)) {
    // Si no hay cuatrimestre válido, usar la clave antigua para compatibilidad
    return saveToStorage(STORAGE_KEYS.CRONOGRAMA_FIXED, fixedBlocks);
  }
  
  const key = `${STORAGE_KEYS.CRONOGRAMA_FIXED}_cuatri${cuatrimestre}`;
  return saveToStorage(key, fixedBlocks);
};

/**
 * Recupera los bloques fijados del cronograma (separados por cuatrimestre)
 * @param {number} cuatrimestre - Cuatrimestre (1 o 2). Si es null, intenta usar el guardado
 */
export const getCronogramaFixed = (cuatrimestre = null) => {
  if (cuatrimestre === null) {
    // Compatibilidad: si no se especifica cuatrimestre, usar el guardado
    cuatrimestre = getCuatrimestreSelected();
  }
  
  if (cuatrimestre === null || (cuatrimestre !== 1 && cuatrimestre !== 2)) {
    // Si no hay cuatrimestre válido, usar la clave antigua para compatibilidad
    const result = getFromStorage(STORAGE_KEYS.CRONOGRAMA_FIXED, []);
    return result && result.data !== undefined ? result.data : result;
  }
  
  const key = `${STORAGE_KEYS.CRONOGRAMA_FIXED}_cuatri${cuatrimestre}`;
  const result = getFromStorage(key, []);
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda las preferencias del usuario
 */
export const saveUserPreferences = (preferences) => {
  return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

/**
 * Recupera las preferencias del usuario
 */
export const getUserPreferences = () => {
  return getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
    autoSave: true,
    showNotifications: true,
    theme: 'light'
  });
};

/**
 * Guarda estados de correlativas (array de { materiaId, estado })
 */
export const saveCorrelativasEstado = (estadoMaterias) => {
  return saveToStorage(STORAGE_KEYS.CORRELATIVAS_ESTADO, estadoMaterias);
};

/**
 * Obtiene estados de correlativas
 */
export const getCorrelativasEstado = () => {
  const result = getFromStorage(STORAGE_KEYS.CORRELATIVAS_ESTADO, []);
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda el cuatrimestre seleccionado en correlativas
 */
export const saveCorrelativasCuatri = (cuatrimestre) => {
  return saveToStorage(STORAGE_KEYS.CORRELATIVAS_CUATRI, cuatrimestre);
};

/**
 * Obtiene el cuatrimestre seleccionado en correlativas
 */
export const getCorrelativasCuatri = () => {
  const result = getFromStorage(STORAGE_KEYS.CORRELATIVAS_CUATRI, null);
  return result && result.data !== undefined ? result.data : result;
};
