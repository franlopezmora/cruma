import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleClick = (e) => {
    toggleTheme();
    // Quitar el focus después del clic para evitar que quede el borde
    setTimeout(() => {
      e.currentTarget.blur();
    }, 0);
  };

  return (
    <div className="theme-toggle-wrapper">
      <button
        type="button"
        className="theme-toggle"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        <Sun
          className="theme-toggle-icon theme-toggle-sun"
          style={{
            opacity: isDark ? 1 : 0.3,
          }}
        />
        <Moon
          className="theme-toggle-icon theme-toggle-moon"
          style={{
            opacity: isDark ? 0.3 : 1,
          }}
        />
        <span
          className="theme-toggle-slider"
          style={{
            transform: isDark ? 'translateX(26px)' : 'translateX(0)',
          }}
        />
      </button>
      {showTooltip && (
        <span className="theme-toggle-tooltip">
          Cambiar a modo {isDark ? 'claro' : 'oscuro'}
        </span>
      )}
    </div>
  );
}

