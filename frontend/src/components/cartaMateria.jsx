import React from "react";
import '../pages/css/correlativas.css';

export const CartaMateria = ({ materia, estadoVisual, onClick }) => {
    const getBadgeLabel = (est) => {
        if (est === 0) return "Bloqueada";
        if (est === 1) return "Habilitada";
        if (est === 2) return "Regular";
        if (est === 3) return "Aprobada";
        return "?";
    };

    const correlativasText = () => {
        let text = "";
        if (materia.necesitaRegular.length > 0) text += `Reg: ${materia.necesitaRegular.map((m) => m.nombre).join(", ")}\n`;
        if (materia.necesitaAprobada.length > 0) text += `Aprob: ${materia.necesitaAprobada.map((m) => m.nombre).join(", ")}`;
        return text || "Sin correlativas";
    };

    return (
        <div
            className={`subject-card estado-${estadoVisual}`}
            onClick={() => onClick && onClick(materia)}
        >
            <div className="correlativas-tooltip">
                {correlativasText()}
            </div>
            <div style={{ paddingTop: '1.2rem', paddingRight: '3.5rem' }}>
                <span style={{ fontSize: '0.8rem' }}>{materia.nombre}</span>
            </div>
            <span className={`status-badge badge-${estadoVisual}`}>
                {getBadgeLabel(estadoVisual)}
            </span>
        </div>
    );
};
