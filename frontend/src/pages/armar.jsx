 import React, { useEffect, useState, useMemo } from 'react'
 import { useLocation, useNavigate } from 'react-router-dom'
 import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap'
 import ScheduleGrid from '../components/ScheduleGrid'

export default function Armar() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const materiaIds = useMemo(() => {
    const q = new URLSearchParams(search).get('materiaIds') || ''
    return q.split(',').map(Number).filter(Boolean)
  }, [search])

  const selectedCuatri = useMemo(() => {
    const c = new URLSearchParams(search).get('cuatri')
    return c == null ? 0 : Number(c)
  }, [search])

  // ➡️ Estados
  const [allMaterias, setAllMaterias] = useState([]);
  const [allComisiones, setAllComisiones] = useState([]);
  const [previewMateriaId, setPreviewMateriaId] = useState(null);
  const [fixedBlocks, setFixedBlocks] = useState([]);


  const comisiones = useMemo(() =>
    allComisiones.filter(c =>
      c.periodo === 0 || c.periodo === selectedCuatri
    ),
    [allComisiones, selectedCuatri]
  );

    const exportarPDF = async () => {
    
    const enrichedBlocks = fixedBlocks.map(b=>{
      const materia = allMaterias.find(m => m.id === b.materiaId)
      const comision = comisiones.find(c => c.comisionId === b.comisionId && c.materiaId === b.materiaId)
      return{
        dia:b.dia,
        horaEntrada:b.horaEntrada,
        horaSalida:b.horaSalida,
        materiaId:b.materiaId,
        nombreMateria: materia.nombre,
        comisionId:b.comisionId,
        seccion: comision.seccion,
      }
    })
  

  const response = await fetch('/api/cronograma/exportar-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(enrichedBlocks)
  });

  if (!response.ok){
    alert("Error al exportar el cronograma")
    return
  }
  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cronogramaCRUMA.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  }
  const onBlockRemove = (materiaId, comisionId) => {
    setFixedBlocks(prev =>
      prev.filter(b => !(b.materiaId === materiaId && b.comisionId === comisionId))
    )
    }

  // 🔥 Redirigir si no hay materias seleccionadas
  useEffect(() => {
    if (materiaIds.length === 0) {
      navigate("/", { replace: true });
    }
  }, [materiaIds, navigate]);

  useEffect(() => {
    if (materiaIds.length > 0) {
      const params = materiaIds.join(',');
      fetch(`/api/materias/seleccionadas?ids=${params}`)
        .then(res => res.json())
        .then(data => setAllMaterias(data))
        .catch(err => console.error("Error cargando materias seleccionadas:", err));
    }
  }, [materiaIds]);

  const selectedMaterias = useMemo(
    () => allMaterias.filter(m => materiaIds.includes(m.id)),
    [allMaterias, materiaIds]
  );

  useEffect(() => {
    const fetchComisiones = async () => {
      try {
        const comisionesAcumuladas = [];
        for (let materiaId of materiaIds) {
          const res = await fetch(
            `/api/materias/${materiaId}/comisiones`
          );
          const data = await res.json();
          comisionesAcumuladas.push(...data);
        }
        setAllComisiones(comisionesAcumuladas);
      } catch (err) {
        console.error("Error cargando comisiones:", err);
      }
    };
    if (materiaIds.length > 0) fetchComisiones();
  }, [materiaIds]);


  const toMin = hora => {
    const [h, m] = hora.split(':').map(Number)
    return (h - 8) * 60 + m
  }


  const isChocante = horarios => {
    const actuales = fixedBlocks.map(b => ({
      dia:   b.dia,
      start: toMin(b.horaEntrada),
      end:   toMin(b.horaSalida)
    }))
    return horarios.some(h => {
      const s2 = toMin(h.horaEntrada), e2 = toMin(h.horaSalida)
      return actuales.some(a =>
        a.dia === h.dia && a.start < e2 && s2 < a.end
      )
    })
  }

  const ordenarHorarios = (horarios) => {
    return [...horarios].sort((a, b) => {
      if (Number(a.dia) !== Number(b.dia)) {
        return Number(a.dia) - Number(b.dia);
      }
      const [ha, ma] = a.horaEntrada.split(':').map(Number);
      const [hb, mb] = b.horaEntrada.split(':').map(Number);
      return (ha * 60 + ma) - (hb * 60 + mb);
    });
  };

const previewBlocks = useMemo(() => {
  if (!previewMateriaId) return [];
  return comisiones
    .filter(c => c.materiaId === previewMateriaId)
    .flatMap(c =>
      ordenarHorarios(c.horarios).map(h => ({
        dia: h.dia,
        horaEntrada: h.horaEntrada,
        horaSalida: h.horaSalida,
        comisionId: c.comisionId,
        materiaId: c.materiaId,
        disabled: isChocante(c.horarios),
        render: (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: '4px',
            fontSize: '0.7rem'
          }}>
            <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
              {h.horaEntrada}
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong>{allMaterias.find(m => m.id === c.materiaId)?.codigo}</strong><br />
              {c.seccion}
            </div>
            <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
              {h.horaSalida}
            </div>
          </div>
        )
      }))
    );
}, [previewMateriaId, comisiones, allMaterias, fixedBlocks]);


const onBlockSelect = (blk) => {
  const com = comisiones.find(
    c => c.comisionId === blk.comisionId && c.materiaId === blk.materiaId
  );
  if (!com) return;

  console.log('✅ Fijando comisión', com.seccion, com.materiaId, com.horarios);

const nuevosFijos = com.horarios.map(h => ({
  dia: h.dia,
  horaEntrada: h.horaEntrada,
  horaSalida: h.horaSalida,
  materiaId: com.materiaId,
  comisionId: com.comisionId,
  render: (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      padding: '4px',
      fontSize: '1rem'
    }}>
      <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
        {h.horaEntrada}
      </div>
      <div style={{ textAlign: 'center' }}>
        <strong>{allMaterias.find(m => m.id === com.materiaId)?.codigo}</strong><br/>
        {com.seccion}
      </div>
      <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
        {h.horaSalida}
      </div>
    </div>
  )
}));


  setFixedBlocks(prev => [...prev, ...nuevosFijos]);
  setPreviewMateriaId(null);
};


  if (!materiaIds.length) return null;

  return (
     <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      minHeight: 0,
      overflow: 'hidden',
      width: '100vw',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box'
    }}>

      <div
        style={{
          flex: '1 1 0%',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          padding: '1.5vw 1vw 1.5vw 1.5vw',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',

          borderRadius: 10,
          boxShadow: '0 2px 10px #0002',
          padding: '0.5vw'
        }}>
          <ScheduleGrid
            fixedBlocks={fixedBlocks}
            previewBlocks={previewBlocks}
            onBlockClick={onBlockSelect}
            onBlockRemove={onBlockRemove}
          />
        </div>
      </div>

      
      <div
        style={{
          width: '300px',
          minWidth: 230,
          maxWidth: '33vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          borderLeft: '2px solid #e5e5e5',
          padding: '2vw 1vw 1vw 1vw',
          boxSizing: 'border-box',
          gap: '12px',
          height: '100vh',
        }}
      >
        <h5 style={{marginTop: 0, marginBottom: 12}}>Materias</h5>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          {selectedMaterias.map(m => {
            const yaFijada = fixedBlocks.some(b => b.materiaId === m.id)
            return (
              <Button
                key={m.id}
                variant={
                  previewMateriaId === m.id ? 'primary'
                  : yaFijada               ? 'success'
                                           : 'outline-primary'
                }
                className="w-100 mb-2"
                disabled={yaFijada}
                style={{marginBottom: 8, fontSize: 15}}
                onClick={() => setPreviewMateriaId(m.id)}
              >
                {m.codigo} – {m.nombre}
              </Button>
            )
          })}
        </div>
        <Button onClick={exportarPDF} className="w-100" variant="outline-secondary" style={{ fontWeight: 600 }}>
          Exportar PDF/EXCEL
        </Button>
      </div>
    </div>
  )
}
