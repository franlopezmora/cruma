import React, { useState, useEffect, useMemo } from 'react'
import './ScheduleGrid.css'

// Helper para convertir hex a rgb
const hexToRgb = (hex) => {
  if (!hex) return '59, 130, 246';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246';
}

const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const startHour = 8
const endHour = 23
const stepMinutes = 5

export default function ScheduleGrid({
  id,
  fixedBlocks = [],
  previewBlocks = [],
  onBlockClick,
  onBlockRemove,
  materiaScheduleInfo = {},
  allMaterias = [],
  allComisiones = []
}) {
  const [newBlocks, setNewBlocks] = useState(new Set());
  const [previousBlocks, setPreviousBlocks] = useState([]);
  
  const HEADER_H = 40;
  const TIME_W = 60;
  const ROW_H = 4.3;

  // Detectar bloques nuevos para animación
  useEffect(() => {
    if (previousBlocks.length === 0) {
      setPreviousBlocks(fixedBlocks);
      return;
    }
    
    const newBlockIds = new Set();
    fixedBlocks.forEach(block => {
      const blockId = `${block.materiaId}-${block.comisionId}-${block.dia}-${block.horaEntrada}`;
      const wasPresent = previousBlocks.some(prevBlock => 
        `${prevBlock.materiaId}-${prevBlock.comisionId}-${prevBlock.dia}-${prevBlock.horaEntrada}` === blockId
      );
      
      if (!wasPresent) {
        newBlockIds.add(blockId);
      }
    });
    
    if (newBlockIds.size > 0) {
      setNewBlocks(newBlockIds);
      setTimeout(() => {
        setNewBlocks(new Set());
      }, 300);
    }
    
    setPreviousBlocks(fixedBlocks);
  }, [fixedBlocks, previousBlocks]);

  // Helper para convertir tiempo a minutos desde el inicio
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - startHour) * 60 + m;
  };

  // Helper para calcular slot index (índice de fila en el grid)
  const timeToSlotIndex = (timeStr) => {
    return Math.floor(timeToMinutes(timeStr) / stepMinutes) + 1; // +1 porque grid-row empieza en 1
  };

  // Mapeo de día a índice de columna (grid-column)
  const diaIndexMap = {
    '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7  // +2 porque col 1 es tiempo
  };

  // Generar timeSlots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        if (h === 23 && m > 5) break;
        slots.push(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
      }
    }
    return slots;
  }, []);

  // Calcular span de filas para un bloque
  const calculateRowSpan = (horaEntrada, horaSalida) => {
    const startMinutes = timeToMinutes(horaEntrada);
    const endMinutes = timeToMinutes(horaSalida);
    return Math.max(1, Math.ceil((endMinutes - startMinutes) / stepMinutes));
  };

  // Procesar bloques preview con solapamiento
  const processedPreviewBlocks = useMemo(() => {
    const blocksByDay = {};
    
    previewBlocks.forEach(blk => {
      const dia = String(blk.dia).trim();
      if (!blocksByDay[dia]) blocksByDay[dia] = [];
      blocksByDay[dia].push(blk);
    });

    const result = [];
    
    Object.entries(blocksByDay).forEach(([dia, blocks]) => {
      // Ordenar por hora de inicio
      const sorted = [...blocks].sort((a, b) => {
        return timeToMinutes(a.horaEntrada) - timeToMinutes(b.horaEntrada);
      });

      // Agrupar por solapamiento
      const groups = [];
      sorted.forEach(block => {
        let added = false;
        for (const group of groups) {
          const anyOverlaps = group.some(b => {
            const bs = timeToMinutes(b.horaEntrada);
            const be = timeToMinutes(b.horaSalida);
            const os = timeToMinutes(block.horaEntrada);
            const oe = timeToMinutes(block.horaSalida);
            return os < be && bs < oe;
          });
          if (anyOverlaps) {
            group.push(block);
            added = true;
            break;
          }
        }
        if (!added) {
          groups.push([block]);
        }
      });

      // Calcular posiciones
      groups.forEach(group => {
        group.sort((a, b) => {
          if (a.comisionId !== b.comisionId) return a.comisionId - b.comisionId;
          return a.materiaId - b.materiaId;
        });

        group.forEach((blk, idx) => {
          result.push({
            ...blk,
            overlapIdx: idx,
            overlapCount: group.length
          });
        });
      });
    });

    return result;
  }, [previewBlocks]);

  // Función para renderizar el contenido de un bloque
  const renderBlockContent = (blk, isPreview = false) => {
    const materia = allMaterias.find(m => m.id === blk.materiaId);
    const comision = allComisiones.find(c => c.comisionId === blk.comisionId);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '6px 8px',
        fontSize: '0.8125rem',
        color: 'white',
        textAlign: 'center',
        lineHeight: '1.4',
        width: '100%',
        boxSizing: 'border-box',
        pointerEvents: 'none'
      }}>
        <div style={{ 
          fontWeight: 500, 
          fontSize: '0.8125rem', 
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          color: 'white',
          textAlign: 'center'
        }}>
          {materia?.codigo || 'N/A'}
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          opacity: 0.9,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          marginBottom: '2px',
          color: 'white',
          textAlign: 'center'
        }}>
          {comision?.seccion || 'N/A'}
        </div>
        <div style={{ 
          fontSize: '0.6875rem', 
          opacity: 0.8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
        }}>
          {blk.horaEntrada} - {blk.horaSalida}
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="schedule-grid-container">
      {/* Header */}
      <div className="grid-header">
        <div className="cell time-header" style={{ width: TIME_W }}>
          <div className="hour-inner">Hora</div>
        </div>
        {days.map(d => (
          <div key={d} className="cell day-header">
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </div>
        ))}
      </div>

      {/* Grid Body - los bloques son elementos grid que hacen span */}
      <div className="grid-body">
        {/* Celdas de la grilla base */}
        {timeSlots.map((timeSlot, slotIdx) => {
          const isHourMark = timeSlot.endsWith(':00');
          const rowNum = slotIdx + 1;
          
          return (
            <React.Fragment key={timeSlot}>
              {/* Columna de tiempo */}
              <div 
                className="cell time-label" 
                style={{ 
                  width: TIME_W, 
                  height: ROW_H,
                  gridRow: rowNum,
                  gridColumn: 1
                }}
              >
                {isHourMark ? timeSlot : ''}
              </div>
              
              {/* Celdas de días - solo para estructura visual */}
              {days.map((day, dayIdx) => {
                const colNum = dayIdx + 2; // +2 porque col 1 es tiempo
                return (
                  <div 
                    key={`${day}-${timeSlot}`}
                    className="cell slot"
                    style={{
                      gridRow: rowNum,
                      gridColumn: colNum
                    }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Bloques fijos - elementos grid que hacen span */}
        {fixedBlocks.map((blk) => {
          const blockId = `${blk.materiaId}-${blk.comisionId}-${blk.dia}-${blk.horaEntrada}`;
          const isNewBlock = newBlocks.has(blockId);
          const scheduleInfo = materiaScheduleInfo[blk.materiaId] || { 
            esMultiple: false, 
            totalHorarios: 1, 
            color: '#6366f1' // Color por defecto (índigo)
          };
          
          const startRow = timeToSlotIndex(blk.horaEntrada);
          const rowSpan = calculateRowSpan(blk.horaEntrada, blk.horaSalida);
          const colNum = diaIndexMap[String(blk.dia)] ?? 2;
          
          // Usar el color de la materia siempre
          const materiaColor = scheduleInfo.color || '#6366f1';
          
          return (
            <div
              key={blockId}
              className={`block fixed ${isNewBlock ? 'adding' : ''}`}
              style={{
                position: 'relative',
                gridRow: `${startRow} / span ${rowSpan}`,
                gridColumn: colNum,
                backgroundColor: materiaColor,
                border: scheduleInfo.esMultiple ? `2px solid ${materiaColor}` : `1px solid ${materiaColor}`,
                boxShadow: scheduleInfo.esMultiple ? `0 0 8px ${materiaColor}80` : 'none',
                opacity: 1,
                zIndex: 1,
                overflow: 'visible'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockRemove?.(blk.materiaId, blk.comisionId);
                }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  borderRadius: '4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: 14,
                  cursor: 'pointer',
                  zIndex: 100,
                  padding: 0,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: 1,
                  pointerEvents: 'auto',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#dc2626';
                  e.target.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#ef4444';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                }}
                title="Quitar comisión"
                tabIndex={-1}
              >×</button>
              {renderBlockContent(blk, false)}
            </div>
          );
        })}

        {/* Bloques preview - elementos grid que hacen span */}
        {processedPreviewBlocks.map((blk) => {
          const blockId = `${blk.materiaId}-${blk.comisionId}-${blk.dia}-${blk.horaEntrada}`;
          
          const startRow = timeToSlotIndex(blk.horaEntrada);
          const rowSpan = calculateRowSpan(blk.horaEntrada, blk.horaSalida);
          const colNum = diaIndexMap[String(blk.dia)] ?? 2;
          
          // Si hay solapamiento, calcular posición y ancho para dividir la columna
          const hasOverlap = blk.overlapCount > 1;
          const blockWidthPercent = hasOverlap ? 100 / blk.overlapCount : 100;
          const marginLeftPercent = hasOverlap ? blk.overlapIdx * blockWidthPercent : 0;
          
          return (
            <div
              key={blockId}
              className={`block preview${blk.disabled ? ' disabled' : ''}`}
              style={{
                gridRow: `${startRow} / span ${rowSpan}`,
                gridColumn: colNum,
                width: `${blockWidthPercent}%`,
                maxWidth: `${blockWidthPercent}%`,
                marginLeft: `${marginLeftPercent}%`,
                zIndex: 2,
                boxSizing: 'border-box'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!blk.disabled && onBlockClick) {
                  onBlockClick(blk);
                }
              }}
            >
              {renderBlockContent(blk, true)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
