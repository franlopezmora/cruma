import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

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
      <Alert
        variant="success"
        style={{
          position: position === "inline" ? 'absolute' : 'fixed',
          top: position === "inline" ? '-5px' : '60px',
          right: position === "inline" ? '-300px' : '20px',
          zIndex: 9999,
          fontSize: '0.8rem',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out',
          margin: '0',
          display: position === "inline" ? 'inline-block' : 'block',
          whiteSpace: 'nowrap'
        }}
      >
        ✅ {message}
      </Alert>
    </>
  );
}
