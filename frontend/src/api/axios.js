import axios from 'axios';

// Asegurar que siempre use /api como baseURL
// Si VITE_API_URL no está definido o está vacío, usar '/api' por defecto
const baseURL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ''
    ? import.meta.env.VITE_API_URL
    : '/api';

export const api = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true, // para que se envíe la cookie de sesión (JSESSIONID) al backend
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401 (no autenticado), limpiar cualquier estado local
    if (error.response?.status === 401) {
      // No hacer nada aquí, dejar que cada componente maneje el 401 según corresponda
      // El AuthContext ya maneja esto en verificarSesion()
    }
    return Promise.reject(error);
  }
);