// Bandera global para trabajar con mocks locales y evitar llamadas a la API/BD.
const flag = import.meta.env.VITE_USE_MOCKS;
export const USE_MOCKS = flag === undefined
  ? true // por defecto usar mocks para no llamar al backend
  : String(flag).toLowerCase() === 'true';

