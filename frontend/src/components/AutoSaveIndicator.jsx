import React, { useState, useEffect } from 'react';

/**
 * Componente que muestra un indicador de guardado automático
 */
export default function AutoSaveIndicator({ isVisible, message = "Datos guardados automáticamente", position = "fixed" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 1000); // Ocultar después de 2 segundos

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          position: position === "inline" ? 'absolute' : 'fixed',
          top: position === "inline" ? '-5px' : '140px',
          right: position === "inline" ? '-300px' : '20px',
          zIndex: 9999,
          fontSize: '0.8125rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          boxShadow: '0 2px 8px var(--shadow)',
          animation: 'slideIn 0.3s ease-out',
          margin: '0',
          display: position === "inline" ? 'inline-block' : 'block',
          whiteSpace: 'nowrap',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e'
        }}
      >
        ✅ {message}
      </div>
    </>
  );
}
