import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';
import { logger } from '../utils/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay parámetro ?logout= en la URL, no verificar sesión
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logout')) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setUsuario(null);
      setLoading(false);
      return;
    }
    
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      
      if (response.data && response.data.mail) {
        setUsuario(response.data);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      // 401 = no autenticado, es normal
      if (error.response?.status !== 401) {
        logger.error('Error al verificar sesión:', error);
      }
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUsuario(null);
      await api.post('/auth/logout');
    } catch (error) {
      logger.warn('Error en logout:', error);
    } finally {
      // Eliminar cookie manualmente
      document.cookie = 'JSESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      sessionStorage.clear();
      // Redirigir con parámetro logout
      window.location.replace('/?logout=' + Date.now());
    }
  };

  const value = {
    usuario,
    loading,
    isAuthenticated: !!usuario,
    verificarSesion,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
