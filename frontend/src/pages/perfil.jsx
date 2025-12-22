import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/axios';
import { logger } from '../utils/logger';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Spinner } from 'react-bootstrap';
import AppButton from '../components/AppButton';
import AppModal from '../components/AppModal';
import { Calendar } from 'lucide-react';
import { USE_MOCKS } from '../utils/env';

export default function Perfil() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { handleApiError } = useErrorHandler();
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cronogramaToDelete, setCronogramaToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [estadoCorrelativas, setEstadoCorrelativas] = useState(null);
  const [loadingCorrelativas, setLoadingCorrelativas] = useState(true);
  const [errorCorrelativas, setErrorCorrelativas] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteEmailError, setDeleteEmailError] = useState('');
  const resumenCorrelativas = estadoCorrelativas?.resumen || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    cargarCronogramas();
    cargarEstadoCorrelativas();
  }, [isAuthenticated, navigate]);

  const cargarCronogramas = async () => {
    if (USE_MOCKS) {
      setCronogramas([
        {
          id: 1,
          nombre: 'Cronograma Demo',
          creadoEn: new Date().toISOString(),
          detalles: [
            { materiaId: 1, comisionId: 101, dia: '1', horaEntrada: '08:00', horaSalida: '10:00' },
            { materiaId: 2, comisionId: 201, dia: '3', horaEntrada: '10:30', horaSalida: '12:30' }
          ]
        }
      ]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/cronogramas');
      setCronogramas(response.data || []);
        } catch (err) {
          const errorMessage = handleApiError(err, 'No se pudieron cargar los cronogramas');
          setError(errorMessage);
        } finally {
      setLoading(false);
    }
  };

  const cargarEstadoCorrelativas = async () => {
    if (!isAuthenticated) return;
    if (USE_MOCKS) {
      setEstadoCorrelativas({
        resumen: {
          aprobadas: 2,
          regulares: 1,
          restantes: 3
        },
        ultimaActualizacion: new Date().toISOString()
      });
      setLoadingCorrelativas(false);
      return;
    }
    try {
      setLoadingCorrelativas(true);
      setErrorCorrelativas(null);
      const resp = await api.get('/correlativas/estado');
      setEstadoCorrelativas(resp.data || null);
    } catch (err) {
      const msg = handleApiError(err, 'No se pudo obtener tu progreso de correlativas');
      setErrorCorrelativas(msg);
    } finally {
      setLoadingCorrelativas(false);
    }
  };

  const eliminarCronograma = (id) => {
    setCronogramaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCronograma = async () => {
    if (!cronogramaToDelete) return;

    try {
      await api.delete(`/cronogramas/${cronogramaToDelete}`);
      cargarCronogramas();
      setShowDeleteModal(false);
      setCronogramaToDelete(null);
    } catch (err) {
      const errorMsg = handleApiError(err, 'Error al eliminar el cronograma');
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      setShowDeleteModal(false);
      setCronogramaToDelete(null);
    }
  };

  const cargarCronograma = (cronograma) => {
    // Convertir detalles del cronograma a formato de bloques para la página armar
    const bloques = cronograma.detalles.map(detalle => ({
      materiaId: detalle.materiaId,
      comisionId: detalle.comisionId,
      dia: detalle.dia,
      horaEntrada: detalle.horaEntrada,
      horaSalida: detalle.horaSalida
    }));

    // Guardar en localStorage temporalmente para que la página armar lo cargue
    // Necesitamos también el periodoId, pero no lo tenemos en el DTO actual
    // Por ahora, asumimos periodo 0 (primer cuatrimestre)
    // TODO: Agregar periodoId al CronogramaDTO
    
    // Obtener materiaIds únicos
    const materiaIds = [...new Set(bloques.map(b => b.materiaId))];
    
    // Guardar en localStorage
    localStorage.setItem('cruma_cronograma_cargado', JSON.stringify({
      bloques,
      materiaIds,
      periodoId: 0, // Por defecto, se puede mejorar después
      nombre: cronograma.nombre
    }));

    // Navegar a la página armar con los IDs de materias
    navigate(`/armar?materiaIds=${materiaIds.join(',')}&cuatri=0`);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const eliminarCuenta = async () => {
    if (!usuario?.id) return;
    try {
      setDeletingAccount(true);
      await api.delete(`/usuarios/${usuario.id}`);
      await logout();
    } catch (err) {
      const msg = handleApiError(err, 'No se pudo eliminar la cuenta');
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  return (
    <>
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Mi Perfil</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          {usuario?.nombre || usuario?.mail}
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Progreso de correlativas</h2>
            {estadoCorrelativas?.ultimaActualizacion && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Actualizado: {formatearFecha(estadoCorrelativas.ultimaActualizacion)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={cargarEstadoCorrelativas}
              disabled={loadingCorrelativas}
            >
              {loadingCorrelativas ? 'Actualizando...' : 'Refrescar'}
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/correlativas')}
            >
              Abrir Correlativas
            </AppButton>
          </div>
        </div>

        {loadingCorrelativas && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
            <Spinner animation="border" size="sm" className="me-2" />
            Cargando progreso guardado...
          </div>
        )}

        {!loadingCorrelativas && errorCorrelativas && (
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {errorCorrelativas}
          </div>
        )}

        {!loadingCorrelativas && !errorCorrelativas && (
          <>
            {estadoCorrelativas?.estados?.length ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem'
              }}>
                {[
                  { label: 'Aprobadas', value: resumenCorrelativas.aprobadas ?? 0, color: '#22c55e' },
                  { label: 'Regulares', value: resumenCorrelativas.regulares ?? 0, color: '#3b82f6' },
                  { label: 'Habilitadas', value: resumenCorrelativas.habilitadas ?? 0, color: '#f59e0b' },
                  { label: 'Bloqueadas', value: resumenCorrelativas.bloqueadas ?? 0, color: '#ef4444' },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.label}</span>
                    <strong style={{ fontSize: '1.5rem', color: item.color }}>{item.value}</strong>
                  </div>
                ))}
                <div style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Materias con estado guardado</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                    {estadoCorrelativas.estados.length}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1.25rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.9375rem'
              }}>
                Aún no guardaste tu progreso de correlativas. Usá el botón "Guardar progreso" en la sección de correlativas para registrarlo en tu perfil.
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Mis Cronogramas</h2>
            <div style={{ position: 'relative' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#fff',
                  fontWeight: 500,
                  padding: '0.375rem 0.875rem',
                  backgroundColor: cronogramas.length >= 3 ? '#ef4444' : 'var(--text-secondary)',
                  borderRadius: '20px',
                  border: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Calendar size={16} strokeWidth={2} />
                <span style={{ 
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.025em'
                }}>
                  {String(cronogramas.length).padStart(2, '0')}/03
                </span>
              </div>
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  opacity: 1,
                  transition: 'opacity 0.2s ease',
                  boxShadow: '0 2px 8px var(--shadow)'
                }}>
                  Has creado {cronogramas.length} de 3 cronogramas
                </div>
              )}
            </div>
          </div>
          <AppButton
            variant="primary"
            onClick={() => navigate('/seleccionar-materias')}
            disabled={cronogramas.length >= 3}
          >
            + Nuevo Cronograma
          </AppButton>
        </div>

        {cronogramas.length >= 3 && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            Has alcanzado el límite de 3 cronogramas. Elimina uno para crear uno nuevo.
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando cronogramas...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '0.875rem 1rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && cronogramas.length === 0 && (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px dashed var(--border-color)'
          }}>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No tienes cronogramas guardados aún
            </p>
            <AppButton
              variant="primary"
              onClick={() => navigate('/seleccionar-materias')}
            >
              Crear mi primer cronograma
            </AppButton>
          </div>
        )}

        {!loading && !error && cronogramas.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {cronogramas.map(cronograma => (
              <div
                key={cronograma.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {cronograma.nombre}
                  </h3>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Creado: {formatearFecha(cronograma.fechaCreacion)}
                  </p>
                  {cronograma.detalles && (
                    <p style={{ 
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {cronograma.detalles.length} bloque{cronograma.detalles.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <AppButton
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      cargarCronograma(cronograma);
                    }}
                    style={{ flex: 1 }}
                  >
                    Abrir
                  </AppButton>
                  <AppButton
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarCronograma(cronograma.id);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.375rem 0.75rem' }}
                    title="Eliminar cronograma"
                  >
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="M30 6.749h-5.331l-3.628-5.442c-0.228-0.337-0.609-0.556-1.041-0.557h-8c-0 0-0 0-0 0-0.432 0-0.813 0.219-1.037 0.552l-0.003 0.004-3.628 5.442h-5.332c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h2.858l1.897 20.864c0.060 0.64 0.594 1.137 1.245 1.137 0 0 0 0 0.001 0h16c0 0 0 0 0 0 0.65 0 1.184-0.497 1.243-1.132l0-0.005 1.897-20.864h2.859c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM12.669 3.25h6.661l2.333 3.499h-11.327zM22.859 28.75h-13.718l-1.772-19.5 17.262-0.001zM11 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM16 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM21 10.75c-0.69 0-1.25 0.56-1.25 1.25v14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c-0-0.69-0.56-1.25-1.25-1.25h-0z"/>
                    </svg>
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección Cuenta (similar a otras secciones) */}
      <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Cuenta</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.35rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Eliminar cuenta</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Acción irreversible. Confirma dentro del modal antes de continuar.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AppButton
              variant="danger"
              size="md"
              onClick={() => {
                setDeleteEmailError('');
                setShowDeleteAccountModal(true);
              }}
              disabled={deletingAccount}
              style={{ minWidth: '190px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 1000 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
                <path d="M702.783 247.985c-39.773.206-74.821 10.255-101.538 25.178-18.481 10.323-32.959 22.99-45.172 36.845l35.17 99.497-112.725 142.081 112.725 132.784-99.157 138.097 48.013-123.49-149.258-144.736 103.332-138.097-58.45-114.197c-10.903-11.501-25.225-22.139-36.969-28.785-27.706-15.475-64.373-25.706-105.977-25.157-5.943.078-11.986.373-18.119.908-49.066 4.279-103.845 23.679-145.495 63.331-41.65 39.652-70.177 99.566-73.316 161.757-3.139 62.191 19.11 126.662 94.14 209.395 75.03 82.732 202.838 183.719 269.593 240.204 66.755 56.485 72.453 68.459 77.878 72.457.853.628 1.699 1.01 2.543.999.843.01 1.689-.372 2.541-1 5.425-3.997 11.126-15.972 77.881-72.456 66.754-56.486 194.561-157.472 269.59-240.205 75.03-82.732 97.279-147.203 94.14-209.394-3.139-62.191-31.666-122.105-73.317-161.757-41.65-39.652-96.429-59.052-145.495-63.331-7.667-.669-15.193-.968-22.558-.93Z" />
              </svg>
              {deletingAccount ? 'Eliminando...' : 'Eliminar cuenta'}
            </AppButton>
          </div>
        </div>
      </div>
    </div>
    <AppModal
      show={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setCronogramaToDelete(null);
      }}
      title="Eliminar cronograma"
      message="¿Estás seguro de que quieres eliminar este cronograma? Esta acción no se puede deshacer."
      cancelText="Cancelar"
      confirmText="Eliminar"
      onConfirm={confirmDeleteCronograma}
      isWarning={true}
    />
    <AppModal
      show={showDeleteAccountModal}
      onClose={() => {
        if (deletingAccount) return;
        setShowDeleteAccountModal(false);
        setDeleteEmailError('');
      }}
      title="Eliminar cuenta"
      message={
        <div style={{ lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Esta acción es irreversible. Se eliminarán tus cronogramas y tu progreso de correlativas.
          </p>
          <p style={{ marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
            Perderás el acceso aunque uses el mismo correo con otro proveedor (GitHub, Google, etc.).
          </p>
          <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Para confirmar, escribe tu correo: <strong>{usuario?.mail}</strong>
          </p>
          {deleteEmailError && (
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.875rem' }}>{deleteEmailError}</p>
          )}
        </div>
      }
      cancelText="Cancelar"
      confirmText={deletingAccount ? "Eliminando..." : "Eliminar cuenta"}
      onConfirm={(inputValue) => {
        const email = usuario?.mail || '';
        if ((inputValue || '').trim().toLowerCase() !== email.trim().toLowerCase()) {
          setDeleteEmailError('El correo no coincide. Escríbelo exactamente para confirmar.');
          return;
        }
        eliminarCuenta();
      }}
      confirmDisabled={deletingAccount}
      holdToConfirm={!deletingAccount}
      holdDuration={1200}
      showInput
      inputPlaceholder="Escribe tu correo para confirmar"
      inputValue=""
      onInputChange={() => setDeleteEmailError('')}
      isWarning={true}
    />
    <AppModal
      show={showErrorModal}
      onClose={() => setShowErrorModal(false)}
      title="Error"
      message={errorMessage}
      cancelText=""
      confirmText="Aceptar"
      onConfirm={() => setShowErrorModal(false)}
      isWarning={false}
    />
    </>
  );
}


