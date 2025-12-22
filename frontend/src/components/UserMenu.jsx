import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function initialsOf(name, email) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? "").join("");
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default function UserMenu() {
  const { usuario, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar al clickear afuera
  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  }, [open]);

  // Ocultar completamente el componente en la página de login
  if (location.pathname === "/login") {
    return null;
  }

  if (loading) {
    return <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', animation: 'pulse 2s infinite' }} />;
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        className="cruma-header-login"
        onClick={() => navigate("/login")}
      >
        Iniciar sesión
      </button>
    );
  }

  const fallback = initialsOf(usuario?.nombre ?? "", usuario?.mail ?? "");

  const handleMenuItemClick = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleToggleClick = (e) => {
    setOpen(v => !v);
    // Quitar el focus después del clic para evitar el borde azul
    setTimeout(() => {
      e.currentTarget.blur();
    }, 0);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        onClick={handleToggleClick}
        className="cruma-header-social-icon"
        style={{
          cursor: 'pointer',
          padding: 0,
          margin: 0,
          width: '30px',
          height: '30px',
          boxSizing: 'border-box',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className="cruma-header-avatar"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            border: 'none'
          }}
        >
          {fallback}
        </div>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: '224px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '0.5rem',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '0.75rem' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--text-primary)'
            }}>
              {usuario?.nombre || "Usuario"}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '0.25rem'
            }}>
              {usuario?.mail}
            </div>
          </div>
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />
          <button
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              outline: 'none'
            }}
            role="menuitem"
            onClick={(e) => {
              handleMenuItemClick("/");
              e.currentTarget.blur();
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </button>
          <button
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              outline: 'none'
            }}
            role="menuitem"
            onClick={(e) => {
              handleMenuItemClick("/perfil");
              e.currentTarget.blur();
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi perfil
          </button>
          <button
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              outline: 'none'
            }}
            role="menuitem"
            onClick={(e) => {
              window.open('http://github.com/franlopezmora/cruma/issues/new', '_blank', 'noopener,noreferrer');
              setOpen(false);
              e.currentTarget.blur();
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Reportar un bug
          </button>
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />
          <button
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#ef4444',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              outline: 'none'
            }}
            role="menuitem"
            onClick={(e) => {
              handleLogout();
              e.currentTarget.blur();
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

