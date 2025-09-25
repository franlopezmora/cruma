import React, { useState, useEffect } from 'react'
import './ScheduleGrid.css'

const days  = ['lunes','martes','miércoles','jueves','viernes','sábado']
const startHour = 8
const endHour = 23
const stepMinutes = 5

const hours = []
for (let h = startHour; h <= endHour; h++) {
  for (let m = 0; m < 60; m += stepMinutes) {
    // cortar en 23:05
    if (h === 23 && m > 5) break
    hours.push(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`)
  }
}

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
    const startHour = 8
    const endHour = 23
    const stepMinutes = 5

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
        // Limpiar la animación después de que termine
        setTimeout(() => {
          setNewBlocks(new Set());
        }, 300);
      }
      
      setPreviousBlocks(fixedBlocks);
    }, [fixedBlocks, previousBlocks]);

    const timeSlots = []
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        // opcional: cortar en 23:05
        if (h === 23 && m > 5) break
        timeSlots.push(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`)
      }
    }

    // calcula altura dinámica para que entre todo
    const ROW_H = 4.3
    const COL_W = `calc((100% - ${TIME_W}px)/6)`;

    // Función para renderizar el contenido de un bloque
    const renderBlockContent = (blk, isPreview = false) => {
      const materia = allMaterias.find(m => m.id === blk.materiaId);
      const comision = allComisiones.find(c => c.comisionId === blk.comisionId);
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: '2px',
          fontSize: '14px',
          minHeight: '20px',
          color: isPreview ? '#333' : '#fff'
        }}>
          <div style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '0.6rem', lineHeight: '1' }}>
            {blk.horaEntrada}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', lineHeight: '1' }}>
            <strong>{materia?.codigo || 'N/A'}</strong><br />
            {comision?.seccion || 'N/A'}
          </div>
          <div style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '0.6rem', lineHeight: '1' }}>
            {blk.horaSalida}
          </div>
        </div>
      );
    };

  return (
    <div id={id} className="schedule-grid-container">

      <div className="grid header">
          <div className="cell time-header" style={{ width: TIME_W }}>
              <div className="hour-inner">Hora</div>
          </div>
        {days.map(d => (
          <div key={d} className="cell day-header">
            {d.charAt(0).toUpperCase()+d.slice(1)}
          </div>
        ))}
      </div>

      <div className="grid body">
        {timeSlots.map(t => {
          const isHourMark = t.endsWith(':00');
          return (
            <React.Fragment key={t}>
              <div className="cell time-label" style={{ width: TIME_W, height: 3.45}}>
                {isHourMark ? t : ''} {/* mostramos solo las horas completas */}
              </div>
              {days.map(d => (
                <div 
                  key={`${d}-${t}`} 
                  className={`cell slot ${isHourMark ? 'hour-mark' : ''}`}
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div className="blocks-overlay">
        {fixedBlocks.map((blk,i) => {
          const [hs, hm] = blk.horaEntrada.split(':').map(Number)
          const [he, em] = blk.horaSalida.split(':').map(Number)
          const minutesFromStart = (h, m) => (h - startHour) * 60 + m

          const top = (minutesFromStart(hs, hm) / stepMinutes) * ROW_H + HEADER_H
          const height = ((minutesFromStart(he, em) - minutesFromStart(hs, hm)) / stepMinutes) * ROW_H

          // Mapear el número de día a índice de columna
          const diaIndexMap = {
            '1': 0, // lunes
            '2': 1, // martes
            '3': 2, // miércoles
            '4': 3, // jueves
            '5': 4, // viernes
            '6': 5  // sábado
          };

          const colIdx = diaIndexMap[String(blk.dia)] ?? 0;
          const left = `calc(${TIME_W}px + ${colIdx} * ${COL_W})`;

          // Verificar si esta materia tiene múltiples horarios
          const scheduleInfo = materiaScheduleInfo[blk.materiaId] || { esMultiple: false, totalHorarios: 1, color: '#28a745' };
          
          // Verificar si es un bloque nuevo para la animación
          const blockId = `${blk.materiaId}-${blk.comisionId}-${blk.dia}-${blk.horaEntrada}`;
          const isNewBlock = newBlocks.has(blockId);

          return (
            <div
              key={i}
              className={`block fixed ${isNewBlock ? 'adding' : ''}`}
              style={{ 
                top, 
                left, 
                width: COL_W, 
                height, 
                position: 'absolute',
                backgroundColor: scheduleInfo.color,
                border: scheduleInfo.esMultiple ? `2px solid ${scheduleInfo.color}` : `1px solid ${scheduleInfo.color}`,
                boxShadow: scheduleInfo.esMultiple ? `0 0 8px ${scheduleInfo.color}80` : 'none',
                opacity: 0.8
              }}
            >
              
              
              <button
                onClick={() => onBlockRemove?.(blk.materiaId, blk.comisionId)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  border: 'none',
                  borderRadius: '50%',
                  background: '#f44',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 13,
                  cursor: 'pointer',
                  zIndex: 10,
                  padding: 0,
                  lineHeight: 1
                }}
                title="Quitar comisión"
                tabIndex={-1}
              >X</button>
              {renderBlockContent(blk, false)}
            </div>
          )
        })}

        {/* preview con reparto de ancho cuando hay solapamiento */}
        {previewBlocks.map((blk,i) => {
          /* … top, height y colIdx … */
          const [hs, hm] = blk.horaEntrada.split(':').map(Number)
          const [he, em] = blk.horaSalida.split(':').map(Number)
          const minutesFromStart = (h, m) => (h - startHour) * 60 + m
          const top    = (minutesFromStart(hs, hm) / stepMinutes) * ROW_H + HEADER_H
          const height = ((minutesFromStart(he, em) - minutesFromStart(hs, hm)) / stepMinutes) * ROW_H
          const diaIndexMap = { '1':0,'2':1,'3':2,'4':3,'5':4,'6':5 }
          const colIdx = diaIndexMap[String(blk.dia)] ?? 0
                  // 1) buscamos TODOS los previewBlocks que chocan con éste
          const solapados = previewBlocks.filter(other => {
            if (other.dia !== blk.dia) return false
            const [os, om] = other.horaEntrada.split(':').map(Number)
            const [oe, om2] = other.horaSalida.split(':').map(Number)
            const a1 = minutesFromStart(hs, hm), a2 = minutesFromStart(he, em)
            const b1 = minutesFromStart(os, om), b2 = minutesFromStart(oe, om2)
            return a1 < b2 && b1 < a2
          })
          // 2) los ordenamos para asignar siempre el mismo índice
          solapados.sort((a,b) =>
            a.comisionId === b.comisionId
              ? a.materiaId - b.materiaId
              : a.comisionId - b.comisionId
          )
          const idx   = solapados.findIndex(o => o === blk)
          const count = solapados.length
                  // 3) ancho y desplazamiento
          const widthSplit = `calc(${COL_W} / ${count})`
          const leftSplit  = `calc(${TIME_W}px + ${colIdx} * ${COL_W} + ${idx} * (${COL_W} / ${count}))`
                  return (
            <div
              key={i}
              className={`block preview${blk.disabled ? ' disabled' : ''}`}
              style={{
                top, height,
                width: widthSplit,
                left:  leftSplit
              }}
              onClick={() => !blk.disabled && onBlockClick(blk)}
            >
              {renderBlockContent(blk, false)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
