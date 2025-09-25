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
  USER_PREFERENCES: 'cruma_user_preferences'
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
 */
export const clearAllAppData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
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
 * Guarda las materias seleccionadas
 */
export const saveMateriasSelected = (materiaIds) => {
  return saveToStorage(STORAGE_KEYS.MATERIAS_SELECTED, materiaIds);
};

/**
 * Recupera las materias seleccionadas
 */
export const getMateriasSelected = () => {
  const result = getFromStorage(STORAGE_KEYS.MATERIAS_SELECTED, []);
  return result && result.data !== undefined ? result.data : result;
};

/**
 * Guarda los bloques fijados del cronograma
 */
export const saveCronogramaFixed = (fixedBlocks) => {
  return saveToStorage(STORAGE_KEYS.CRONOGRAMA_FIXED, fixedBlocks);
};

/**
 * Recupera los bloques fijados del cronograma
 */
export const getCronogramaFixed = () => {
  const result = getFromStorage(STORAGE_KEYS.CRONOGRAMA_FIXED, []);
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
