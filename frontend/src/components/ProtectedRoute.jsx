import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente que protege rutas, redirigiendo a login si el usuario no está autenticado.
 * Muestra un loading mientras verifica la sesión.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras se verifica la sesión, mostrar loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al home con state para mostrar mensaje
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: window.location.pathname }} replace />;
  }

  // Si está autenticado, renderizar el componente hijo
  return children;
}

