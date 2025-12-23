import { useState } from 'react';

export default function BotonCafecito() {
    const [estaHover, setEstaHover] = useState(false);

    return (
        <a
            href="https://cafecito.app/cruma"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Invitame un café en cafecito.app"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '1.5rem',
                zIndex: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '50px',
                background: estaHover
                    ? 'linear-gradient(135deg, #33d4ff 0%, #5cc4ff 50%, #a8f3ff 100%)'
                    : 'linear-gradient(135deg, #00c9ff 0%, #38b6ff 50%, #92effd 100%)',
                color: '#0a1628',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: estaHover
                    ? '0 8px 25px rgba(56, 182, 255, 0.5), 0 0 40px rgba(146, 239, 253, 0.4)'
                    : '0 4px 15px rgba(56, 182, 255, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transform: estaHover ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
                fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
            }}
            onMouseEnter={() => setEstaHover(true)}
            onMouseLeave={() => setEstaHover(false)}
        >
            <span
                style={{
                    fontSize: '1.25rem',
                    transition: 'transform 0.3s ease',
                    transform: estaHover ? 'rotate(-15deg) scale(1.1)' : 'rotate(0) scale(1)'
                }}
            >
                ☕
            </span>
            <span>Invitame un cafecito</span>
        </a>
    );
}
