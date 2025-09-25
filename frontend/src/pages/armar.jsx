 import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import ScheduleGrid from '../components/ScheduleGrid'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { Document, Page, Text, View, StyleSheet, pdf, Link, Image } from '@react-pdf/renderer'
import { 
  saveCronogramaFixed, 
  getCronogramaFixed,
  getMateriasSelected,
  getCuatrimestreSelected,
  clearAllAppData 
} from '../utils/localStorage'
import AutoSaveIndicator from '../components/AutoSaveIndicator'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#464141', // Fondo gris oscuro como el cronograma
    padding: 20,
  },
  scheduleContainer: {
    flex: 1,
    marginBottom: 0,
    padding: 0,
  },
  scheduleImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '80%',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    textAlign: 'left',
  },
  footerText: {
    fontSize: 10,
    color: '#ffffff', // Texto blanco para contraste con fondo oscuro
    marginBottom: 1,
  },
  developerLink: {
    fontSize: 9,
    color: '#4fc3f7', // Azul más claro para mejor contraste
    textDecoration: 'none',
  },
});

export default function Armar() {
  const navigate = useNavigate()
  const { search } = useLocation()

  const materiaIds = useMemo(() => {
    const q = new URLSearchParams(search).get('materiaIds') || ''
    const urlIds = q.split(',').map(Number).filter(Boolean)
    
    // Si no hay IDs en la URL, intentar cargar desde localStorage
    if (urlIds.length === 0) {
      const savedMaterias = getMateriasSelected()
      return savedMaterias || []
    }
    
    return urlIds
  }, [search])

  const selectedCuatri = useMemo(() => {
    const c = new URLSearchParams(search).get('cuatri')
    if (c != null) {
      return Number(c)
    }
    
    // Si no hay cuatrimestre en la URL, intentar cargar desde localStorage
    const savedCuatri = getCuatrimestreSelected()
    return savedCuatri || 0
  }, [search])

  // ➡️ Estados
  const [allMaterias, setAllMaterias] = useState([]);
  const [allComisiones, setAllComisiones] = useState([]);
  const [previewMateriaId, setPreviewMateriaId] = useState(null);
  const [fixedBlocks, setFixedBlocks] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);

  // Función helper para mostrar el indicador de guardado
  const showSaveMessage = () => {
    // Resetear el indicador para que se active de nuevo
    setShowSaveIndicator(false);
    setTimeout(() => setShowSaveIndicator(true), 10);
  };

  const comisiones = useMemo(() =>
    allComisiones.filter(c =>
      c.periodo === 0 || c.periodo === selectedCuatri
    ),
    [allComisiones, selectedCuatri]
  );


  const exportarPDF = async () => {
    try {
      // Buscar el elemento del cronograma
      const scheduleElement = document.getElementById('schedule-grid');
      if (!scheduleElement) {
        alert('No se encontró el cronograma para exportar');
        return;
      }

      // Capturar el cronograma como imagen
      const canvas = await html2canvas(scheduleElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#464141', // Fondo gris oscuro como en la web
        height: scheduleElement.scrollHeight,
        width: scheduleElement.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');

      // Crear documento PDF con react-pdf
      const MyDocument = () => (
        <Document>
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.scheduleContainer}>
              <Image src={imgData} style={styles.scheduleImage} />
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Desarrollado por:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Link 
                  src="https://www.linkedin.com/in/franciscolopezmora/" 
                  style={styles.developerLink}
                >
                  Francisco López Mora
                </Link>
                <Text style={styles.footerText}> | </Text>
                <Link 
                  src="https://www.linkedin.com/in/franconicolassotogaray/" 
                  style={styles.developerLink}
                >
                  Franco Nicolás Soto Garay
                </Link>
              </View>
            </View>
          </Page>
        </Document>
      );

      // Generar y descargar PDF
      const blob = await pdf(<MyDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cronograma.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar el PDF');
    }
  };

  const exportarExcel = () => {
    try {
      
      // Validar que tenemos datos
      if (fixedBlocks.length === 0) {
        alert('No hay materias fijadas en el cronograma. Agrega algunas materias primero.');
        return;
      }
      
      if (allMaterias.length === 0) {
        alert('No se han cargado las materias. Intenta nuevamente.');
        return;
      }
      
      // Crear la estructura de datos para Excel con formato de grilla
      const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
      const horas = [
        '08:00-08:45', '08:45-09:30', '09:40-10:25', '10:25-11:10', '11:20-12:05', '12:05-12:50',
        '13:15-14:00', '14:00-14:45', '14:55-15:40', '15:40-16:25', '16:35-17:20', '17:20-18:05',
        '18:05-18:15', '18:15-19:00', '19:00-19:45', '19:55-20:40', '20:40-21:25', '21:35-22:20',
        '22:20-23:05'
      ];

      // Crear matriz de datos
      const data = [];
      
      // Encabezado con días
      const header = ['HORARIO', ...dias];
      data.push(header);

      // Crear mapa de colores para cada materia
      const coloresMaterias = {};
      const materiasUnicas = [...new Set(fixedBlocks.map(block => block.materiaId))];
      const colores = ['FFFF00', 'FF69B4', '87CEEB', 'FF0000', '90EE90', 'FFA500', 'FFC0CB', 'DDA0DD'];
      
      materiasUnicas.forEach((materiaId, index) => {
        coloresMaterias[materiaId] = colores[index % colores.length];
      });

      // Llenar cada fila de hora
      horas.forEach(hora => {
        const fila = [hora];
        
        dias.forEach((dia, diaIndex) => {
          const diaNumero = diaIndex + 1; // Lunes = 1, Martes = 2, etc.
          // Buscar bloque que coincida con esta hora y día
          // Los dias en fixedBlocks son strings ('1', '2', etc.), no números
          const diaString = diaNumero.toString();
          const bloque = fixedBlocks.find(block => {
            if (block.dia !== diaString) return false;
            
            const [horaInicio, horaFin] = hora.split('-');
            const bloqueInicio = block.horaEntrada;
            const bloqueFin = block.horaSalida;
            
            // Convertir horarios a minutos para comparación más precisa
            const convertirAMinutos = (horaStr) => {
              const [h, m] = horaStr.split(':').map(Number);
              return h * 60 + m;
            };
            
            const inicioMinutos = convertirAMinutos(horaInicio);
            const finMinutos = convertirAMinutos(horaFin);
            const bloqueInicioMinutos = convertirAMinutos(bloqueInicio);
            const bloqueFinMinutos = convertirAMinutos(bloqueFin);
            
            // Verificar si hay solapamiento entre los intervalos
            return (inicioMinutos < bloqueFinMinutos && finMinutos > bloqueInicioMinutos);
          });
          
          if (bloque) {
            const materia = allMaterias.find(m => m.id === bloque.materiaId);
            const comision = allComisiones.find(c => c.comisionId === bloque.comisionId);
            const texto = `${materia?.codigo || 'N/A'} (${comision?.seccion || 'N/A'})`;
            fila.push(texto);
          } else {
            fila.push('');
          }
        });
        
        data.push(fila);
      });

      // Crear libro de trabajo
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

      // Aplicar estilos y colores
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      // Estilo para encabezado
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '' };
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "E0E0E0" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      // Aplicar colores a las celdas con materias
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c + 1; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddress] && ws[cellAddress].v) {
            // Buscar el bloque correspondiente para obtener el color
            const hora = horas[row - 1];
            const diaIndex = col - 1;
            const diaNumero = diaIndex + 1;
            
            const bloque = fixedBlocks.find(block => {
              if (block.dia !== diaNumero.toString()) return false;
              
              const [horaInicio, horaFin] = hora.split('-');
              const bloqueInicio = block.horaEntrada;
              const bloqueFin = block.horaSalida;
              
              // Convertir horarios a minutos para comparación más precisa
              const convertirAMinutos = (horaStr) => {
                const [h, m] = horaStr.split(':').map(Number);
                return h * 60 + m;
              };
              
              const inicioMinutos = convertirAMinutos(horaInicio);
              const finMinutos = convertirAMinutos(horaFin);
              const bloqueInicioMinutos = convertirAMinutos(bloqueInicio);
              const bloqueFinMinutos = convertirAMinutos(bloqueFin);
              
              // Verificar si hay solapamiento entre los intervalos
              return (inicioMinutos < bloqueFinMinutos && finMinutos > bloqueInicioMinutos);
            });
            
            if (bloque) {
              const color = coloresMaterias[bloque.materiaId];
              ws[cellAddress].s = {
                fill: { fgColor: { rgb: color } },
                font: { bold: true, color: { rgb: "000000" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "000000" } },
                  bottom: { style: "thin", color: { rgb: "000000" } },
                  left: { style: "thin", color: { rgb: "000000" } },
                  right: { style: "thin", color: { rgb: "000000" } }
                }
              };
            }
          }
        }
      }

      // Ajustar ancho de columnas
      ws['!cols'] = [
        { width: 15 }, // Columna de horarios
        { width: 20 }, // Lunes
        { width: 20 }, // Martes
        { width: 20 }, // Miércoles
        { width: 20 }, // Jueves
        { width: 20 }  // Viernes
      ];

      // Exportar archivo
      XLSX.writeFile(wb, 'cronograma.xlsx');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar el Excel');
    }
  };
  const onBlockRemove = (materiaId, comisionId) => {
    setFixedBlocks(prev => {
      const newBlocks = prev.filter(b => !(b.materiaId === materiaId && b.comisionId === comisionId));
      saveCronogramaFixed(newBlocks);
      return newBlocks;
    });
    
    // Mostrar indicador de materia removida
    showSaveMessage();
  }

  const clearAllBlocks = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el cronograma?')) {
      setFixedBlocks([]);
      saveCronogramaFixed([]);
      showSaveMessage();
    }
  }

  // 🔥 Cargar cronograma guardado al montar
  useEffect(() => {
    const savedCronograma = getCronogramaFixed();
    if (savedCronograma && savedCronograma.length > 0) {
      setFixedBlocks(savedCronograma);
    }
    
    // Verificar si se están cargando datos desde localStorage
    const savedMaterias = getMateriasSelected();
    const urlParams = new URLSearchParams(search);
    const hasUrlParams = urlParams.get('materiaIds') || urlParams.get('cuatri');
    
    if (savedMaterias && savedMaterias.length > 0 && !hasUrlParams) {
      setIsLoadingFromStorage(true);
      // Ocultar el indicador después de un momento
      setTimeout(() => setIsLoadingFromStorage(false), 2000);
    }
  }, [search]);

  // 🔥 Limpiar bloques de materias que ya no están seleccionadas
  useEffect(() => {
    if (materiaIds.length > 0 && fixedBlocks.length > 0) {
      const validBlocks = fixedBlocks.filter(block => 
        materiaIds.includes(block.materiaId)
      );
      
      if (validBlocks.length !== fixedBlocks.length) {
        setFixedBlocks(validBlocks);
        saveCronogramaFixed(validBlocks);
        setShowSaveIndicator(true);
      }
    } else if (materiaIds.length === 0 && fixedBlocks.length > 0) {
      // Si no hay materias seleccionadas, limpiar todo el cronograma
      setFixedBlocks([]);
      saveCronogramaFixed([]);
    }
  }, [materiaIds, fixedBlocks]);

  // 🔥 Redirigir si no hay materias seleccionadas Y no hay datos guardados
  useEffect(() => {
    if (materiaIds.length === 0) {
      const savedCronograma = getCronogramaFixed();
      const savedMaterias = getMateriasSelected();
      
      // Solo redirigir si no hay datos guardados en localStorage
      if ((!savedCronograma || savedCronograma.length === 0) && 
          (!savedMaterias || savedMaterias.length === 0)) {
        navigate("/", { replace: true });
      }
    }
  }, [materiaIds, navigate]);

  // 🔥 Guardar cronograma cuando cambie
  useEffect(() => {
    if (fixedBlocks.length > 0) {
      saveCronogramaFixed(fixedBlocks);
    }
  }, [fixedBlocks]);

  useEffect(() => {
    if (materiaIds.length > 0) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const params = materiaIds.join(',');
      fetch(`${apiUrl}/api/materias/seleccionadas?ids=${params}`)
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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const comisionesAcumuladas = [];
        for (let materiaId of materiaIds) {
          const res = await fetch(
            `${apiUrl}/api/materias/${materiaId}/comisiones`
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
  }

  // Función para identificar materias con múltiples horarios
  const getMateriaScheduleInfo = (materiaId) => {
    const horarios = fixedBlocks.filter(b => b.materiaId === materiaId);
    const diasUnicos = [...new Set(horarios.map(h => h.dia))];
    const totalHorarios = horarios.length;
    
    return {
      totalHorarios,
      diasUnicos: diasUnicos.length,
      esMultiple: totalHorarios > 1,
      horariosPorDia: diasUnicos.map(dia => ({
        dia: dia,
        horarios: horarios.filter(h => h.dia === dia).map(h => `${h.horaEntrada}-${h.horaSalida}`)
      }))
    };
  }

  // Función para obtener el nombre del día
  const getDiaNombre = (diaNumero) => {
    const dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    return dias[diaNumero] || 'Desconocido';
  };

  // Función para obtener colores consistentes por materia
  const getMateriaColor = (materiaId) => {
    const colores = [
      '#E74C3C', // Rojo vibrante
      '#3498DB', // Azul sólido
      '#2ECC71', // Verde esmeralda
      '#F39C12', // Naranja
      '#9B59B6', // Púrpura
      '#1ABC9C', // Turquesa
      '#E67E22', // Naranja oscuro
      '#34495E', // Azul gris oscuro
      '#8E44AD', // Púrpura oscuro
      '#27AE60'  // Verde oscuro
    ];
    
    // Usar el ID de la materia para generar un índice consistente
    // Esto asegura que la misma materia siempre tenga el mismo color
    const hash = materiaId.toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % colores.length;
    return colores[index];
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
        disabled: isChocante(c.horarios)
      }))
    );
}, [previewMateriaId, comisiones, fixedBlocks]);


const onBlockSelect = (blk) => {
  const com = comisiones.find(
    c => c.comisionId === blk.comisionId && c.materiaId === blk.materiaId
  );
  if (!com) return;

  const nuevosFijos = com.horarios.map(h => ({
    dia: h.dia,
    horaEntrada: h.horaEntrada,
    horaSalida: h.horaSalida,
    materiaId: com.materiaId,
    comisionId: com.comisionId
  }));

  setFixedBlocks(prev => {
    const newBlocks = [...prev, ...nuevosFijos];
    saveCronogramaFixed(newBlocks);
    return newBlocks;
  });
  setPreviewMateriaId(null);
  
  // Mostrar indicador de materia fijada
  showSaveMessage();
};


  if (!materiaIds.length) return null;

  return (
     <>
       <style>
         {`
           @keyframes fadeIn {
             from {
               opacity: 0;
               transform: translateX(-50%) translateY(-10px);
             }
             to {
               opacity: 1;
               transform: translateX(-50%) translateY(0);
             }
           }
         `}
       </style>
       {isLoadingFromStorage && (
         <div style={{
           position: 'fixed',
           top: '20px',
           left: '50%',
           transform: 'translateX(-50%)',
           zIndex: 9999,
           backgroundColor: '#007bff',
           color: 'white',
           padding: '8px 16px',
           borderRadius: '6px',
           fontSize: '0.9rem',
           boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
           animation: 'fadeIn 0.3s ease-out'
         }}>
           📚 Cargando datos guardados...
         </div>
       )}
       <div style={{
      display: 'flex',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
      height: window.innerWidth <= 768 ? 'auto' : '100vh',
      minHeight: 0,
      overflow: 'hidden',
      width: '100vw',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box'
    }}>

      {/* Panel principal del cronograma */}
      <div
        style={{
          flex: window.innerWidth <= 768 ? 'none' : '1 1 0%',
          minWidth: 0,
          minHeight: window.innerWidth <= 768 ? '50vh' : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          padding: window.innerWidth <= 768 ? '0.5rem' : '0.5vw 1vw 1.5vw 1.5vw',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px',
          padding: '0 8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <h4 style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem' }}>
              📅 Cronograma
            </h4>
            {fixedBlocks.length > 0 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={clearAllBlocks}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  height: '24px'
                }}
                title="Limpiar todo el cronograma"
              >
                🗑️ Limpiar
              </Button>
            )}
            <AutoSaveIndicator isVisible={showSaveIndicator} message="Cronograma guardado automáticamente" position="inline" />
          </div>
          {window.innerWidth > 768 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                fontSize: '1.1rem',
                padding: '3px 6px',
                minWidth: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={sidebarCollapsed ? 'Mostrar panel de materias' : 'Ocultar panel de materias'}
            >
              ☰
            </Button>
          )}
        </div>
        
        <div style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          borderRadius: 8,
          padding: window.innerWidth <= 768 ? '0.25rem' : '0.25vw',
          border: '2px solid #e5e5e5',
          backgroundColor: '#464141',
          boxShadow: '0 2px 8px #464141'
        }}>
          <ScheduleGrid
            id="schedule-grid"
            fixedBlocks={fixedBlocks}
            previewBlocks={previewBlocks}
            onBlockClick={onBlockSelect}
            onBlockRemove={onBlockRemove}
            allMaterias={allMaterias}
            allComisiones={allComisiones}
            materiaScheduleInfo={selectedMaterias.reduce((acc, m) => {
              acc[m.id] = {
                ...getMateriaScheduleInfo(m.id),
                color: getMateriaColor(m.id)
              };
              return acc;
            }, {})}
          />
        </div>
      </div>

      {/* Sidebar de materias */}
      {(!sidebarCollapsed || window.innerWidth <= 768) && (
        <div
          style={{
            width: window.innerWidth <= 768 ? '100%' : '300px',
            minWidth: window.innerWidth <= 768 ? 'auto' : '230px',
            maxWidth: window.innerWidth <= 768 ? 'none' : '33vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            borderLeft: window.innerWidth <= 768 ? 'none' : '2px solid #e5e5e5',
            borderTop: window.innerWidth <= 768 ? '2px solid #e5e5e5' : 'none',
            padding: window.innerWidth <= 768 ? '1rem' : '2vw 1vw 1vw 1vw',
            boxSizing: 'border-box',
            gap: '12px',
            height: window.innerWidth <= 768 ? 'auto' : '100vh',
            maxHeight: window.innerWidth <= 768 ? '50vh' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 12,
          flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap',
          gap: window.innerWidth <= 768 ? '8px' : '0'
        }}>
          <h5 style={{
            margin: 0,
            fontSize: window.innerWidth <= 768 ? '1rem' : '1.25rem'
          }}>Materias</h5>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => navigate('/seleccionar-materias')}
            style={{ 
              fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.8rem', 
              padding: window.innerWidth <= 768 ? '3px 6px' : '4px 8px'
            }}
          >
            ← Volver
          </Button>
        </div>
        
        {previewMateriaId && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Vista previa: {allMaterias.find(m => m.id === previewMateriaId)?.codigo}
            </span>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => setPreviewMateriaId(null)}
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              ✕ Cancelar
            </Button>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
          {/* Materias fijadas */}
          {selectedMaterias.filter(m => fixedBlocks.some(b => b.materiaId === m.id)).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8,
                borderBottom: '2px solid #28a745',
                paddingBottom: '4px'
              }}>
                <h6 style={{ 
                  color: '#28a745', 
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  📌 Materias Fijadas
                </h6>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres desfijar todas las materias? Esta acción no se puede deshacer.')) {
                      setFixedBlocks([]);
                    }
                  }}
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    height: '24px',
                    fontWeight: 'normal'
                  }}
                  title="Desfijar todas las materias"
                >
                  Desfijar Todas
                </Button>
              </div>
              {selectedMaterias
                .filter(m => fixedBlocks.some(b => b.materiaId === m.id))
                .map(m => {
                  const comisionesFijadas = fixedBlocks.filter(b => b.materiaId === m.id)
                  const scheduleInfo = getMateriaScheduleInfo(m.id)
                  
                  return (
                    <div key={m.id} style={{ 
                      marginBottom: 8,
                      padding: '8px',
                      backgroundColor: `${getMateriaColor(m.id)}20`,
                      border: `2px solid ${getMateriaColor(m.id)}`,
                      borderRadius: '6px',
                      position: 'relative'
                    }}>
                      {/* Indicador de materia múltiple */}
                      {scheduleInfo.esMultiple && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '8px',
                          backgroundColor: getMateriaColor(m.id),
                          color: '#fff',
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          🔄 {scheduleInfo.totalHorarios} dias
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6c757d' }}>
                            {m.codigo} – {m.nombre}
                          </span>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setFixedBlocks(prev => prev.filter(b => b.materiaId !== m.id))}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            minWidth: 'auto',
                            height: '20px',
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545'
                          }}
                          title="Desfijar materia"
                        >
                          ✕
                        </Button>
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d'
                      }}>
                        <strong>Comisión:</strong> {comisionesFijadas[0]?.comisionId ? 
                          comisiones.find(c => c.comisionId === comisionesFijadas[0].comisionId)?.seccion : 'N/A'}
                      </div>
                      
                      {/* Información detallada de horarios */}
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#856404',
                        backgroundColor: '#fff3cd',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ffeaa7',
                        marginTop: '4px'
                      }}>
                        <strong>Horarios:</strong>
                        {scheduleInfo.horariosPorDia.map((diaInfo, index) => (
                          <div key={index} style={{ marginTop: '2px' }}>
                            <strong>{getDiaNombre(parseInt(diaInfo.dia))}:</strong> {diaInfo.horarios.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Materias disponibles */}
          {selectedMaterias.filter(m => !fixedBlocks.some(b => b.materiaId === m.id)).length > 0 && (
            <div>
              <h6 style={{ 
                color: '#007bff', 
                marginBottom: 8, 
                fontSize: '0.9rem',
                fontWeight: 'bold',
                borderBottom: '2px solid #007bff',
                paddingBottom: '4px'
              }}>
                📚 Materias Disponibles
              </h6>
              {selectedMaterias
                .filter(m => !fixedBlocks.some(b => b.materiaId === m.id))
                .map(m => (
                  <Button
                    key={m.id}
                    variant={previewMateriaId === m.id ? 'primary' : 'outline-primary'}
                    className="w-100"
                    style={{
                      fontSize: window.innerWidth <= 768 ? 12 : 15,
                      textAlign: 'left',
                      padding: window.innerWidth <= 768 ? '8px 12px' : '12px 16px',
                      marginBottom: 8,
                      whiteSpace: 'normal',
                      height: 'auto',
                      minHeight: window.innerWidth <= 768 ? '40px' : 'auto'
                    }}
                    onClick={(e) => {
                      if (previewMateriaId === m.id) {
                        setPreviewMateriaId(null);
                        e.target.blur();
                      } else {
                        setPreviewMateriaId(m.id);
                      }
                    }}
                  >
                    {m.codigo} – {m.nombre}
                  </Button>
                ))}
            </div>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button 
            onClick={exportarPDF} 
            className="flex-fill" 
            variant="outline-danger" 
            style={{ 
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.9rem',
              padding: window.innerWidth <= 768 ? '6px 8px' : '8px 12px'
            }}
          >
            📄 PDF
          </Button>
          <Button 
            onClick={exportarExcel} 
            className="flex-fill" 
            variant="outline-success" 
            style={{ 
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.9rem',
              padding: window.innerWidth <= 768 ? '6px 8px' : '8px 12px',
              marginLeft: '10px'
            }}
          >
            📊 Excel
          </Button>
        </div>
        </div>
      )}
    </div>
     </>
  )
}
