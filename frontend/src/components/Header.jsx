import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import cafecitoButton from "../assets/button_6.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showTooltips, setShowTooltips] = useState({
    github: false,
    linkedin: false
  });
  const [hoverTimeouts, setHoverTimeouts] = useState({});
  const [linkedinMenuOpen, setLinkedinMenuOpen] = useState(false);
  const linkedinMenuRef = useRef(null);

  // Cerrar menú de LinkedIn al clickear afuera
  useEffect(() => {
    function onDocClick(e) {
      if (!linkedinMenuRef.current) return;
      if (!linkedinMenuRef.current.contains(e.target)) setLinkedinMenuOpen(false);
    }
    if (linkedinMenuOpen) {
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  }, [linkedinMenuOpen]);

  // Determinar qué página está activa
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCorrelativas = () => navigate("/correlativas");
  const goToArmar = () => navigate("/seleccionar-materias");
  const goToPerfil = () => navigate("/perfil");

  const handleMouseEnter = (tooltip) => {
    const timeout = setTimeout(() => {
      setShowTooltips(prev => ({ ...prev, [tooltip]: true }));
    }, 500);
    setHoverTimeouts(prev => ({ ...prev, [tooltip]: timeout }));
  };

  const handleMouseLeave = (tooltip) => {
    if (hoverTimeouts[tooltip]) {
      clearTimeout(hoverTimeouts[tooltip]);
      setHoverTimeouts(prev => ({ ...prev, [tooltip]: null }));
    }
    setShowTooltips(prev => ({ ...prev, [tooltip]: false }));
  };

  return (
    <header className="cruma-header">
      <div className="cruma-header-inner">
        {/* Brand */}
        <button
          className="cruma-header-brand"
          type="button"
          onClick={goHome}
          aria-label="Ir al inicio"
        >
          cruma.app
        </button>

        <nav className="cruma-header-nav" aria-label="Navegación principal">
          <button
            type="button"
            onClick={goHome}
            className={isActive("/") ? "active" : ""}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={goToCorrelativas}
            className={isActive("/correlativas") ? "active" : ""}
          >
            Correlativas
          </button>
          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={goToArmar}
                className={isActive("/seleccionar-materias") || isActive("/armar") ? "active" : ""}
              >
                Armar cronograma
              </button>
              <button
                type="button"
                onClick={goToPerfil}
                className={isActive("/perfil") ? "active" : ""}
              >
                Mi perfil
              </button>
            </>
          )}
        </nav>

        {/* Right side: social icons, theme toggle, and user menu */}
        <div className="cruma-header-right">
          {/* GitHub */}
          <a
            href="https://github.com/franlopezmora/cruma"
            target="_blank"
            rel="noopener noreferrer"
            className="cruma-header-social-icon"
            aria-label="GitHub"
            onMouseEnter={() => handleMouseEnter('github')}
            onMouseLeave={() => handleMouseLeave('github')}
            style={{
              width: '30px',
              height: '30px',
              boxSizing: 'border-box',
              padding: 0,
              margin: 0
            }}
          >
            <div className="cruma-header-icon-wrapper">
              <svg
                viewBox="0 0 24 24"
                className="cruma-header-icon-svg"
                fill="currentColor"
                style={{ 
                  width: '18px', 
                  height: '18px',
                  flexShrink: 0
                }}
                aria-hidden="true"
              >
                <path d="M12 .5a12 12 0 00-3.794 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.26 1.86 1.26 1.08 1.86 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.66-.3-5.46-1.34-5.46-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.47 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0012 .5z" />
              </svg>
            </div>
            {showTooltips.github && (
              <span className="cruma-header-tooltip">
                GitHub
              </span>
            )}
          </a>

          {/* LinkedIn Menu */}
          <div style={{ position: 'relative' }} ref={linkedinMenuRef}>
            <button
              type="button"
              className="cruma-header-social-icon"
              aria-label="LinkedIn"
              onClick={(e) => {
                setLinkedinMenuOpen(v => !v);
                setTimeout(() => {
                  e.currentTarget.blur();
                }, 0);
              }}
              onMouseEnter={() => handleMouseEnter('linkedin')}
              onMouseLeave={() => handleMouseLeave('linkedin')}
              style={{ 
                outline: 'none', 
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                boxSizing: 'border-box',
                padding: 0,
                margin: 0
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              <div className="cruma-header-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  className="cruma-header-icon-svg"
                  fill="currentColor"
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    color: 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              {showTooltips.linkedin && !linkedinMenuOpen && (
                <span className="cruma-header-tooltip">
                  LinkedIn
                </span>
              )}
            </button>

            {linkedinMenuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '230px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '0.5rem',
                  zIndex: 1000,
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}
              >
                                <a
                  href="https://www.linkedin.com/in/franconicolassotogaray/"
                  target="_blank"
                  rel="noopener noreferrer"
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
                    textDecoration: 'none',
                    outline: 'none',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  role="menuitem"
                  onClick={() => setLinkedinMenuOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg
                    className="cruma-header-icon-svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ flexShrink: 0, width: '16px', height: '16px' }}
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0
                  }}>
                    Nicolás Soto Garay
                  </span>
                </a>
                <a
                  href="https://www.linkedin.com/in/franciscolopezmora/"
                  target="_blank"
                  rel="noopener noreferrer"
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
                    textDecoration: 'none',
                    outline: 'none',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  role="menuitem"
                  onClick={() => setLinkedinMenuOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg
                    className="cruma-header-icon-svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ flexShrink: 0, width: '16px', height: '16px' }}
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0
                  }}>
                    Francisco López Mora
                  </span>
                </a>
              </div>
            )}
          </div>

          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

