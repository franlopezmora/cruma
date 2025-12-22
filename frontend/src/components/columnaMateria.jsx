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
          className="btn btn-sm btn-outline-light"
          style={{ fontSize: "0.65rem", padding: "2px 6px" }}
          title="Avanzar estado de todas las materias habilitadas"
        >
          ⏩
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
