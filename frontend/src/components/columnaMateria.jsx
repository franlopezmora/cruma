import React from "react";
import { CartaMateria } from "./cartaMateria";
import "../pages/css/correlativas.css";

export const Columna = ({ nivel, materias, onMateriaClick, onActualizarNivel, bolsas }) => {
  const { bolsaRegulares, bolsaAprobadas } = bolsas;

  const isElectivas = nivel === "Electivas";

  return (
    <div className={`level-column ${isElectivas ? "level-column-electivas" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", maxWidt: "200px" }}>
        <h3 className="level-title" style={{ margin: 0 }}>
          {isElectivas ? "Electivas" : `Nivel ${nivel}`}
          <button
            onClick={() => onActualizarNivel(materias)}
            aria-label="Avanzar estado de todas las materias del nivel"
            title="Avanzar estado de todas las materias del nivel"
            style={{
              marginLeft: "0.5rem",
              border: "none",
              background: "transparent",
              padding: "4px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease",
              outline: "none"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(2px) translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0) translateY(0)";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transition: "transform 0.2s ease, color 0.2s ease" }}
            >
              <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 7H17V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </h3>

      </div>


      <div className="cards-stack">
        {materias.map((mat) => {
          const habilitada = mat.validarCorrelativas(bolsaRegulares, bolsaAprobadas);
          const estadoVisual = habilitada ? (mat.estado === 0 ? 1 : mat.estado) : 0;

          return (
            <CartaMateria
              key={mat.id}
              materia={mat}
              estadoVisual={estadoVisual}
              onClick={habilitada ? onMateriaClick : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};
