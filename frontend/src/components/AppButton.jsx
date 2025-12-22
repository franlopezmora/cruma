import { useMemo } from 'react';

/**
 * Botón del sistema - Minimalista y sutil
 * Componente reutilizable con variantes y tamaños
 */
export default function AppButton({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  ...props 
}) {
  const buttonStyles = useMemo(() => {
    const sizeStyles = {
      sm: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem' },
      md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      lg: { padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }
    };

    const variantBaseStyles = {
      default: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
      },
      primary: {
        background: 'var(--text-primary)',
        color: 'var(--bg-primary)',
        border: '1px solid var(--text-primary)',
      },
      secondary: {
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
      },
      danger: {
        background: '#e74c3c',
        border: '1px solid #e74c3c',
        color: '#fff',
      },
      success: {
        background: 'none',
        border: '1px solid var(--border-color)',
        color: '#22c55e',
      },
    };

    return {
      ...sizeStyles[size],
      ...variantBaseStyles[variant],
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: style.justifyContent || 'center',
      gap: '0.5rem',
      ...style,
    };
  }, [size, variant, disabled, style]);

  const variantClass = `app-button-${variant}`;
  const sizeClass = `app-button-${size}`;
  const disabledClass = disabled ? 'app-button-disabled' : '';

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={`app-button ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim()}
      style={buttonStyles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

