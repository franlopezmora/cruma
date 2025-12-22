/**
 * Estilos del sistema - Minimalistas y sutiles
 * Para usar en todos los componentes
 */

export const buttonStyles = {
  base: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    outline: 'none',
  },
  hover: {
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: 'var(--border-color)',
  },
  primary: {
    background: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    border: '1px solid var(--text-primary)',
  },
  primaryHover: {
    background: 'var(--text-secondary)',
    borderColor: 'var(--text-secondary)',
  },
  secondary: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
  },
  secondaryHover: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  },
  danger: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: '#ef4444',
  },
  dangerHover: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
};

export const inputStyles = {
  base: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    width: '100%',
  },
  focus: {
    borderColor: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
  },
};

export const cardStyles = {
  base: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
  },
  hover: {
    borderColor: 'var(--text-tertiary)',
  },
};

