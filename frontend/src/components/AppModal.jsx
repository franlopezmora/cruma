import { Modal } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';

/**
 * Modal genérico reutilizable para la aplicación
 * Soporta diferentes variantes: información, advertencia, confirmación, input
 */
export default function AppModal({ 
  show, 
  onClose, 
  title = 'Información',
  message = '',
  cancelText = 'Cancelar',
  confirmText = 'Aceptar',
  onConfirm,
  isWarning = false,
  showInput = false,
  inputValue = '',
  inputPlaceholder = '',
  onInputChange,
  holdToConfirm = false,
  holdDuration = 1200,
  confirmDisabled = false
}) {
  const [inputText, setInputText] = useState(inputValue);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdRef = useRef(null);
  const holdStartRef = useRef(0);

  useEffect(() => {
    if (show) {
      setInputText(inputValue);
      cancelHold();
    }
  }, [show, inputValue]);

  const handleConfirm = () => {
    if (onConfirm) {
      if (showInput) {
        onConfirm(inputText);
      } else {
        onConfirm();
      }
    } else {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const cancelHold = () => {
    if (holdRef.current) {
      cancelAnimationFrame(holdRef.current);
      holdRef.current = null;
    }
    setHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => cancelHold, []);

  const stepHold = (timestamp) => {
    if (!holdStartRef.current) holdStartRef.current = timestamp;
    const elapsed = timestamp - holdStartRef.current;
    const progress = Math.min(1, elapsed / holdDuration);
    setHoldProgress(progress);
    if (progress >= 1) {
      cancelHold();
      handleConfirm();
      return;
    }
    holdRef.current = requestAnimationFrame(stepHold);
  };

  const startHold = (e) => {
    if (confirmDisabled || (showInput && !inputText.trim())) return;
    e.preventDefault();
    cancelHold();
    setHolding(true);
    holdStartRef.current = 0;
    holdRef.current = requestAnimationFrame(stepHold);
  };

  const releaseHold = () => {
    cancelHold();
  };

  const disabled = confirmDisabled || (showInput && !inputText.trim());

  return (
    <Modal 
      show={show} 
      onHide={onClose}
      centered
      backdrop={true}
      keyboard={true}
      style={{ zIndex: 9999 }}
    >
      <Modal.Header closeButton={false} style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
        <Modal.Title style={{ fontSize: '1rem', fontWeight: 500 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ paddingTop: '0.5rem', paddingBottom: '1rem' }}>
        <div style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: showInput ? '1rem' : 0 }}>
          {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
        </div>
        {showInput && (
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={inputPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                handleConfirm();
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
            }}
          />
        )}
      </Modal.Body>
      <Modal.Footer style={{ borderTop: 'none', paddingTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {cancelText && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-tertiary)';
              e.target.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            {cancelText}
          </button>
        )}
        <button
          type="button"
          onClick={holdToConfirm ? undefined : handleConfirm}
          onMouseDown={holdToConfirm ? startHold : undefined}
          onMouseUp={holdToConfirm ? releaseHold : undefined}
          onMouseLeave={holdToConfirm ? releaseHold : undefined}
          onTouchStart={holdToConfirm ? startHold : undefined}
          onTouchEnd={holdToConfirm ? releaseHold : undefined}
          onTouchCancel={holdToConfirm ? releaseHold : undefined}
          disabled={disabled}
          style={{
            background: isWarning ? '#e74c3c' : 'var(--bg-secondary)',
            border: `1px solid ${isWarning ? '#e74c3c' : 'var(--border-color)'}`,
            color: isWarning ? '#fff' : 'var(--text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            opacity: disabled ? 0.5 : 1,
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (isWarning) {
              e.target.style.backgroundColor = '#d84335';
              e.target.style.borderColor = '#d84335';
            } else {
              e.target.style.backgroundColor = 'var(--bg-tertiary)';
              e.target.style.borderColor = 'var(--border-color)';
            }
          }}
          onMouseLeave={(e) => {
            if (isWarning) {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.borderColor = '#e74c3c';
            } else {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
              e.target.style.borderColor = 'var(--border-color)';
            }
          }}
        >
          {holdToConfirm && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.12)',
                transformOrigin: 'left center',
                transform: `scaleX(${holding ? holdProgress : 0})`,
                transition: holding ? 'none' : 'transform 0.2s ease',
                pointerEvents: 'none'
              }}
            />
          )}
          {confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

