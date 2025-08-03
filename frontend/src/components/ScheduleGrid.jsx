import React from 'react'
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
  fixedBlocks = [],
  previewBlocks = [],
  onBlockClick,
  onBlockRemove
}) {
    const HEADER_H = 40;
    const TIME_W = 60;
    const startHour = 8
    const endHour = 23
    const stepMinutes = 5

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

  return (
    <div className="schedule-grid-container">

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
        {timeSlots.map(t => (
          <React.Fragment key={t}>
            <div className="cell time-label" style={{ width: TIME_W, height: 3.45}}>
              {t.endsWith(':00') ? t : ''} {/* mostramos solo las horas completas */}
            </div>
            {days.map(d => (
              <div key={`${d}-${t}`} className="cell slot" />
            ))}
          </React.Fragment>
        ))}
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

          return (
            <div
              key={i}
              className="block fixed"
              style={{ top, left, width: COL_W, height, position: 'absolute' }}
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
              {blk.render}
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
              {blk.render}
            </div>
          )
        })}
      </div>
    </div>
  )
}
