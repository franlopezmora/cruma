import { useEffect, useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppButton from '../components/AppButton'
import ScheduleGrid from '../components/ScheduleGrid'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { Document, Page, Text, View, StyleSheet, pdf, Link, Image } from '@react-pdf/renderer'
import {
  saveCronogramaFixed,
  getCronogramaFixed,
  getMateriasSelected,
  getCuatrimestreSelected
} from '../utils/localStorage'
import { api } from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import { mapearPeriodoFrontendABackend } from '../utils/periodoUtils'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { logger } from '../utils/logger'
import { convertirNombreADia } from '../utils/dateUtils'
import AppModal from '../components/AppModal'
import { USE_MOCKS } from '../utils/env'
import { materiasMockApi } from '../mocks/materiasMocks'
import { comisionesMock } from '../mocks/comisionesMock'

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
  const { isAuthenticated } = useAuth()
  const { handleApiError } = useErrorHandler()

  const selectedCuatri = useMemo(() => {
    const cParam = new URLSearchParams(search).get('cuatri')
    const cNumber = cParam != null ? Number(cParam) : null
    if (cNumber === 1 || cNumber === 2) {
      return cNumber
    }

    // Si no hay cuatrimestre en la URL, intentar cargar desde localStorage
    const savedCuatri = getCuatrimestreSelected()
    const savedNumber = savedCuatri != null ? Number(savedCuatri) : 0
    return savedNumber === 1 || savedNumber === 2 ? savedNumber : 0
  }, [search])

  const materiaIds = useMemo(() => {
    const q = new URLSearchParams(search).get('materiaIds') || ''
    const urlIds = q.split(',').map(Number).filter(Boolean)

    // Si no hay IDs en la URL, intentar cargar desde localStorage del cuatrimestre actual
    if (urlIds.length === 0) {
      const savedMaterias = getMateriasSelected(Number(selectedCuatri))
      return savedMaterias || []
    }

    return urlIds
  }, [search, selectedCuatri])

  // ➡️ Estados
  const [allMaterias, setAllMaterias] = useState([]);
  const [allComisiones, setAllComisiones] = useState([]);
  const [previewMateriaId, setPreviewMateriaId] = useState(null);
  const [fixedBlocks, setFixedBlocks] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [guardandoCronograma, setGuardandoCronograma] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningAction, setWarningAction] = useState(null);
  const [warningType, setWarningType] = useState(null); // 'clearAll' | 'unfixAll'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [cronogramaNombre, setCronogramaNombre] = useState('');

  // Estados para modales de información y error
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  
  // Estados para tooltips de materias
  const [hoveredMateriaId, setHoveredMateriaId] = useState(null);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

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

  // Verificar si una materia tiene horarios disponibles en el cuatrimestre actual
  const materiaHasHorarios = useCallback((materiaId) => {
    return comisiones.some(c => c.materiaId === materiaId);
  }, [comisiones]);


  const exportarPDF = async () => {
    try {
      // Buscar el elemento del cronograma
      const scheduleElement = document.getElementById('schedule-grid');
      if (!scheduleElement) {
        setErrorModalMessage('No se encontró el cronograma para exportar');
        setShowErrorModal(true);
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
      logger.error('Error al exportar PDF:', error);
      setErrorModalMessage('Error al exportar el PDF');
      setShowErrorModal(true);
    }
  };

  const exportarExcel = () => {
    try {

      // Validar que tenemos datos
      if (fixedBlocks.length === 0) {
        setInfoModalMessage('No hay materias fijadas en el cronograma. Agrega algunas materias primero.');
        setShowInfoModal(true);
        return;
      }

      if (allMaterias.length === 0) {
        setInfoModalMessage('No se han cargado las materias. Intenta nuevamente.');
        setShowInfoModal(true);
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
      logger.error('Error al exportar Excel:', error);
      setErrorModalMessage('Error al exportar el Excel');
      setShowErrorModal(true);
    }
  };
  const onBlockRemove = (materiaId, comisionId) => {
    setFixedBlocks(prev => {
      const newBlocks = prev.filter(b => !(b.materiaId === materiaId && b.comisionId === comisionId));
      saveCronogramaFixed(newBlocks, selectedCuatri);
      return newBlocks;
    });

    // Mostrar indicador de materia removida
    showSaveMessage();
  }

  const clearAllBlocks = () => {
    setWarningAction(() => () => {
      setFixedBlocks([]);
      saveCronogramaFixed([], selectedCuatri);
      showSaveMessage();
    });
    setWarningType('clearAll');
    setShowWarningModal(true);
  }

  const handleWarningConfirm = () => {
    if (warningAction) {
      warningAction();
    }
    setShowWarningModal(false);
    setWarningAction(null);
    setWarningType(null);
  }

  const getWarningModalConfig = () => {
    if (!warningType) return null;

    if (warningType === 'clearAll') {
      return {
        title: 'Limpiar cronograma',
        message: '¿Estás seguro de que quieres limpiar todo el cronograma? Esta acción no se puede deshacer.',
        confirmText: 'Limpiar',
        isWarning: true
      };
    } else if (warningType === 'unfixAll') {
      return {
        title: 'Desfijar todas las materias',
        message: '¿Estás seguro de que quieres desfijar todas las materias? Esta acción no se puede deshacer.',
        confirmText: 'Desfijar',
        isWarning: true
      };
    }

    return null;
  }

  const guardarCronogramaEnBackend = async () => {
    if (!isAuthenticated) {
      setInfoModalMessage('Debes iniciar sesión para guardar cronogramas');
      setShowInfoModal(true);
      return;
    }

    if (fixedBlocks.length === 0) {
      setInfoModalMessage('No hay bloques en el cronograma para guardar');
      setShowInfoModal(true);
      return;
    }

    // Mostrar modal para ingresar nombre
    const nombreDefault = `Cronograma ${new Date().toLocaleDateString('es-AR')}`;
    setCronogramaNombre(nombreDefault);
    setShowNameModal(true);
  }

  const handleGuardarConNombre = async (nombre) => {
    if (!nombre || nombre.trim() === '') {
      return;
    }

    try {
      setGuardandoCronograma(true);
      setShowNameModal(false);

      // Mapear selectedCuatri (0 o 1) al periodoId real de la BD
      const periodoIdReal = mapearPeriodoFrontendABackend(selectedCuatri);

      const payload = {
        nombre: nombre.trim(),
        periodoId: periodoIdReal,
        bloques: fixedBlocks.map(block => ({
          materiaId: block.materiaId,
          comisionId: block.comisionId,
          dia: block.dia,
          horaEntrada: block.horaEntrada,
          horaSalida: block.horaSalida
        }))
      };

      await api.post('/cronogramas', payload);
      setShowSuccessModal(true);
    } catch (error) {
      const mensajeError = handleApiError(error, 'Error al guardar el cronograma. Por favor, intenta nuevamente.');
      setErrorModalMessage(mensajeError);
      setShowErrorModal(true);
    } finally {
      setGuardandoCronograma(false);
    }
  }

  // 🔥 Cargar cronograma guardado al montar (del cuatrimestre actual)
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const hasUrlParams = urlParams.get('materiaIds') || urlParams.get('cuatri');

    // Si hay parámetros en la URL, significa que venimos de correlativas o del perfil
    // En ese caso, NO usar localStorage para evitar parpadeos
    if (hasUrlParams) {
      // Solo cargar si hay un cronograma específico del perfil
      const cronogramaCargado = localStorage.getItem('cruma_cronograma_cargado');
      if (cronogramaCargado) {
        try {
          const data = JSON.parse(cronogramaCargado);
          if (data.bloques && data.bloques.length > 0) {
            setFixedBlocks(data.bloques);
            // Limpiar el flag después de cargar
            localStorage.removeItem('cruma_cronograma_cargado');
          }
        } catch (e) {
          logger.error('Error al cargar cronograma desde perfil:', e);
          localStorage.removeItem('cruma_cronograma_cargado');
        }
      }
      // No cargar desde localStorage normal si hay parámetros en la URL
      return;
    }

    // Si NO hay parámetros en la URL, cargar desde localStorage (sesión continua)
    // Primero verificar si hay un cronograma cargado desde el perfil
    const cronogramaCargado = localStorage.getItem('cruma_cronograma_cargado');
    if (cronogramaCargado) {
      try {
        const data = JSON.parse(cronogramaCargado);
        if (data.bloques && data.bloques.length > 0) {
          setFixedBlocks(data.bloques);
          // Limpiar el flag después de cargar
          localStorage.removeItem('cruma_cronograma_cargado');
        }
      } catch (e) {
        logger.error('Error al cargar cronograma desde perfil:', e);
        localStorage.removeItem('cruma_cronograma_cargado');
      }
    } else {
      // Si no hay cronograma del perfil, cargar desde localStorage normal
      const savedCronograma = getCronogramaFixed(selectedCuatri);
      if (savedCronograma && savedCronograma.length > 0) {
        setFixedBlocks(savedCronograma);
      }
    }

    // Verificar si se están cargando datos desde localStorage
    const savedMaterias = getMateriasSelected(selectedCuatri);

    if (savedMaterias && savedMaterias.length > 0) {
      setIsLoadingFromStorage(true);
      // Ocultar el indicador después de un momento
      setTimeout(() => setIsLoadingFromStorage(false), 2000);
    }
  }, [search, selectedCuatri]);

  // 🔥 Limpiar bloques de materias que ya no están seleccionadas
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const hasUrlParams = urlParams.get('materiaIds') || urlParams.get('cuatri');

    if (materiaIds.length > 0 && fixedBlocks.length > 0) {
      const validBlocks = fixedBlocks.filter(block =>
        materiaIds.includes(block.materiaId)
      );

      if (validBlocks.length !== fixedBlocks.length) {
        setFixedBlocks(validBlocks);
        // Solo guardar en localStorage si NO hay parámetros en la URL
        if (!hasUrlParams) {
          saveCronogramaFixed(validBlocks, selectedCuatri);
        }
        setShowSaveIndicator(true);
      }
    } else if (materiaIds.length === 0 && fixedBlocks.length > 0) {
      // Si no hay materias seleccionadas, limpiar todo el cronograma
      setFixedBlocks([]);
      // Solo guardar en localStorage si NO hay parámetros en la URL
      if (!hasUrlParams) {
        saveCronogramaFixed([], selectedCuatri);
      }
    }
  }, [materiaIds, fixedBlocks, selectedCuatri, search]);

  // 🔥 Redirigir si no hay materias seleccionadas Y no hay datos guardados
  useEffect(() => {
    if (materiaIds.length === 0) {
      const savedCronograma = getCronogramaFixed(selectedCuatri);
      const savedMaterias = getMateriasSelected(selectedCuatri);

      // Solo redirigir si no hay datos guardados en localStorage
      if ((!savedCronograma || savedCronograma.length === 0) &&
        (!savedMaterias || savedMaterias.length === 0)) {
        navigate("/", { replace: true });
      }
    }
  }, [materiaIds, navigate, selectedCuatri]);

  // 🔥 Guardar cronograma cuando cambie (con el cuatrimestre actual)
  // Solo guardar si NO hay parámetros en la URL (sesión continua, no nueva)
  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const hasUrlParams = urlParams.get('materiaIds') || urlParams.get('cuatri');

    // Si hay parámetros en la URL, no guardar automáticamente al inicio
    // Solo guardar si el usuario está trabajando en una sesión continua
    if (!hasUrlParams && fixedBlocks.length > 0 && selectedCuatri) {
      saveCronogramaFixed(fixedBlocks, selectedCuatri);
    }
  }, [fixedBlocks, selectedCuatri, search]);

  useEffect(() => {
    if (materiaIds.length > 0) {
      if (USE_MOCKS) {
        const data = materiasMockApi.filter(m => materiaIds.includes(m.id));
        setAllMaterias(data);
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const params = materiaIds.join(',');
      fetch(`${apiUrl}/api/materias/seleccionadas?ids=${params}`)
        .then(res => res.json())
        .then(data => setAllMaterias(data))
        .catch(err => logger.error("Error cargando materias seleccionadas:", err));
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
          let data = [];
          if (USE_MOCKS) {
            data = comisionesMock.filter(c => c.materiaId === materiaId);
          } else {
            const res = await fetch(
              `${apiUrl}/api/materias/${materiaId}/comisiones`
            );
            data = await res.json();
          }
          // Transformar los horarios: convertir diaSemana (nombre) a dia (número)
          const comisionesTransformadas = data.map(comision => ({
            ...comision,
            horarios: comision.horarios.map(horario => {
              // El backend puede devolver 'diaSemana' o 'dia', normalizar a 'dia'
              const diaOriginal = horario.dia || horario.diaSemana || horario.dia_semana;
              const diaConvertido = convertirNombreADia(diaOriginal);

              return {
                ...horario,
                dia: diaConvertido
              };
            })
          }));
          comisionesAcumuladas.push(...comisionesTransformadas);
        }
        setAllComisiones(comisionesAcumuladas);
      } catch (err) {
        logger.error("Error cargando comisiones:", err);
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
      dia: b.dia,
      start: toMin(b.horaEntrada),
      end: toMin(b.horaSalida)
    }))
    return horarios.some(h => {
      const s2 = toMin(h.horaEntrada), e2 = toMin(h.horaSalida)
      const diaH = convertirNombreADia(h.dia) // Convertir a número para comparar
      return actuales.some(a =>
        a.dia === diaH && a.start < e2 && s2 < a.end
      )
    })
  }

  const ordenarHorarios = (horarios) => {
    return [...horarios].sort((a, b) => {
      const diaA = Number(convertirNombreADia(a.dia));
      const diaB = Number(convertirNombreADia(b.dia));
      if (diaA !== diaB) {
        return diaA - diaB;
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
      '#27AE60', // Verde oscuro
      '#FF6382', // Rosa coral
      '#36A2EB', // Azul claro
      '#FFCE56', // Amarillo
      '#4BC0C0', // Cian
      '#9966FF', // Violeta
      '#FF9F40', // Naranja claro
      '#C9CBCF', // Gris claro
      '#FF6B6B', // Rojo coral claro
      '#4ECDC4', // Turquesa medio
      '#45B7D1', // Azul cielo
      '#96CEB4', // Verde menta
      '#DDA15E', // Marrón dorado
      '#BC6C25', // Marrón oscuro
      '#6C5CE7', // Púrpura índigo
      '#A29BFE', // Púrpura claro
      '#FD79A8', // Rosa fucsia
      '#FDCB6E', // Amarillo dorado
      '#55A3FF', // Azul brillante
      '#00B894'  // Verde esmeralda claro
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
    const blocks = comisiones
      .filter(c => c.materiaId === previewMateriaId)
      .flatMap(c =>
        ordenarHorarios(c.horarios).map(h => {
          // El día ya debería estar convertido en fetchComisiones, pero por si acaso lo convertimos de nuevo
          const diaOriginal = h.dia || h.diaSemana || h.dia_semana;
          const diaNum = convertirNombreADia(diaOriginal);

          return {
            dia: diaNum,
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            comisionId: c.comisionId,
            materiaId: c.materiaId,
            disabled: isChocante(c.horarios)
          };
        })
      );

    return blocks;
  }, [previewMateriaId, comisiones, fixedBlocks]);


  const onBlockSelect = (blk) => {
    const com = comisiones.find(
      c => c.comisionId === blk.comisionId && c.materiaId === blk.materiaId
    );
    if (!com) return;

    const nuevosFijos = com.horarios.map(h => ({
      dia: convertirNombreADia(h.dia), // Asegurar que sea número
      horaEntrada: h.horaEntrada,
      horaSalida: h.horaSalida,
      materiaId: com.materiaId,
      comisionId: com.comisionId
    }));

    setFixedBlocks(prev => {
      const newBlocks = [...prev, ...nuevosFijos];
      // Solo guardar en localStorage si NO hay parámetros en la URL (sesión continua)
      const urlParams = new URLSearchParams(search);
      const hasUrlParams = urlParams.get('materiaIds') || urlParams.get('cuatri');
      if (!hasUrlParams) {
        saveCronogramaFixed(newBlocks, selectedCuatri);
      }
      return newBlocks;
    });
    setPreviewMateriaId(null);

    // Mostrar indicador de materia fijada
    showSaveMessage();
  };


  // Si no hay materias seleccionadas, redirigir a seleccionar-materias
  // Redirigir a seleccionar-materias si no hay materias seleccionadas
  useEffect(() => {
    if (!materiaIds.length) {
      navigate('/seleccionar-materias');
    }
  }, [materiaIds.length, navigate]);

  if (!materiaIds.length) {
    return null;
  }

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
          backgroundColor: 'var(--accent-color)',
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
        width: '100%',
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
            <h4 style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M7 2a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1V3a1 1 0 1 0-2 0v1H8V3a1 1 0 0 0-1-1Zm12 6H5v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Zm-1-3a1 1 0 0 1 1 1v1H5V6a1 1 0 0 1 1-1h1v1a1 1 0 1 0 2 0V5h6v1a1 1 0 1 0 2 0V5h1Z"/>
              </svg>
              Cronograma
            </h4>
            {fixedBlocks.length > 0 && (
              <AppButton
                variant="danger"
                size="sm"
                onClick={clearAllBlocks}
                title="Limpiar todo el cronograma"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M30 6.749h-5.331l-3.628-5.442c-0.228-0.337-0.609-0.556-1.041-0.557h-8c-0 0-0 0-0 0-0.432 0-0.813 0.219-1.037 0.552l-0.003 0.004-3.628 5.442h-5.332c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h2.858l1.897 20.864c0.060 0.64 0.594 1.137 1.245 1.137 0 0 0 0 0.001 0h16c0 0 0 0 0 0 0.65 0 1.184-0.497 1.243-1.132l0-0.005 1.897-20.864h2.859c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM12.669 3.25h6.661l2.333 3.499h-11.327zM22.859 28.75h-13.718l-1.772-19.5 17.262-0.001zM11 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM16 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM21 10.75c-0.69 0-1.25 0.56-1.25 1.25v14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c-0-0.69-0.56-1.25-1.25-1.25h-0z"/>
                </svg>
                Limpiar
              </AppButton>
            )}
            {isAuthenticated && fixedBlocks.length > 0 && (
              <AppButton
                variant="success"
                size="sm"
                onClick={guardarCronogramaEnBackend}
                disabled={guardandoCronograma}
                style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Guardar cronograma en tu perfil"
              >
                {guardandoCronograma ? (
                  'Guardando...'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Guardar
                  </>
                )}
              </AppButton>
            )}
          </div>
          {window.innerWidth > 768 && (
            <AppButton
              variant="secondary"
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
            </AppButton>
          )}
        </div>
        
        <div 
          className="schedule-grid-wrapper"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            borderRadius: 8,
            padding: window.innerWidth <= 768 ? '0.5rem' : '0.75rem',
            border: '1px solid var(--border-color, #e5e7eb)',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
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
              borderLeft: window.innerWidth <= 768 ? 'none' : '2px solid var(--border-color)',
              borderTop: window.innerWidth <= 768 ? '2px solid var(--border-color)' : 'none',
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
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/seleccionar-materias')}
              >
                ← Volver
              </AppButton>
            </div>

            {previewMateriaId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Vista previa: {allMaterias.find(m => m.id === previewMateriaId)?.codigo}
                </span>
                <AppButton
                  variant="danger"
                  size="sm"
                  onClick={() => setPreviewMateriaId(null)}
                >
                  ✕ Cancelar
                </AppButton>
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
              {/* Materias fijadas */}
              {selectedMaterias.filter(m => fixedBlocks.some(b => b.materiaId === m.id)).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <AppButton
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setWarningAction(() => () => {
                          setFixedBlocks([]);
                        });
                        setWarningType('unfixAll');
                        setShowWarningModal(true);
                      }}
                      title="Desfijar todas las materias"
                    >
                      Desfijar Todas
                    </AppButton>
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
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                {m.codigo} – {m.nombre}
                              </span>
                            </div>
                            <AppButton
                              variant="danger"
                              size="sm"
                              onClick={() => setFixedBlocks(prev => prev.filter(b => b.materiaId !== m.id))}
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                minWidth: 'auto',
                                height: '20px'
                              }}
                              title="Desfijar materia"
                            >
                              ✕
                            </AppButton>
                          </div>

                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            <strong>Comisión:</strong> {comisionesFijadas[0]?.comisionId ?
                              comisiones.find(c => c.comisionId === comisionesFijadas[0].comisionId)?.seccion : 'N/A'}
                          </div>

                          {/* Información detallada de horarios */}
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#fbbf24',
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
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
                  {selectedMaterias
                    .filter(m => !fixedBlocks.some(b => b.materiaId === m.id))
                    .map(m => {
                      const hasHorarios = materiaHasHorarios(m.id);
                      return (
                        <div 
                          key={m.id}
                          style={{ position: 'relative', marginBottom: 8 }}
                          onMouseEnter={() => {
                            if (!hasHorarios) {
                              const timeout = setTimeout(() => {
                                setHoveredMateriaId(m.id);
                              }, 500);
                              setTooltipTimeout(timeout);
                            }
                          }}
                          onMouseLeave={() => {
                            if (tooltipTimeout) {
                              clearTimeout(tooltipTimeout);
                              setTooltipTimeout(null);
                            }
                            setHoveredMateriaId(null);
                          }}
                        >
                          <AppButton
                            variant={previewMateriaId === m.id ? 'primary' : 'default'}
                            className="w-100"
                            disabled={!hasHorarios}
                            style={{
                              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.9375rem',
                              textAlign: 'left',
                              padding: window.innerWidth <= 768 ? '0.5rem 0.75rem' : '0.75rem 1rem',
                              whiteSpace: 'normal',
                              height: 'auto',
                              minHeight: window.innerWidth <= 768 ? '40px' : 'auto',
                              width: '100%',
                              justifyContent: 'flex-start',
                              opacity: !hasHorarios ? 0.5 : 1,
                              cursor: !hasHorarios ? 'not-allowed' : 'pointer'
                            }}
                            onClick={(e) => {
                              if (!hasHorarios) return;
                              if (previewMateriaId === m.id) {
                                setPreviewMateriaId(null);
                                e.target.blur();
                              } else {
                                setPreviewMateriaId(m.id);
                              }
                            }}
                          >
                            {m.codigo} – {m.nombre}
                          </AppButton>
                          {!hasHorarios && hoveredMateriaId === m.id && (
                            <span className="cruma-header-tooltip" style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginTop: '8px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-sans)',
                              color: 'var(--text-primary)',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              opacity: 1,
                              transition: 'opacity 0.2s ease',
                              pointerEvents: 'none',
                              whiteSpace: 'nowrap',
                              zIndex: 1000,
                              boxShadow: '0 2px 8px var(--shadow)',
                              fontWeight: 500
                            }}>
                              Sin horarios en este cuatrimestre
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', width: '100%' }}>
              <AppButton
                onClick={exportarPDF}
                variant="danger"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                PDF
              </AppButton>
              <AppButton
                onClick={exportarExcel}
                variant="success"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <rect x="8" y="12" width="8" height="7"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                  <line x1="12" y1="12" x2="12" y2="19"/>
                </svg>
                Excel
              </AppButton>
            </div>
          </div>
        )}
      </div>
      {showWarningModal && (() => {
        const config = getWarningModalConfig();
        if (!config) return null;

        return (
          <AppModal
            show={showWarningModal}
            onClose={() => {
              setShowWarningModal(false);
              setWarningAction(null);
              setWarningType(null);
            }}
            title={config.title}
            message={config.message}
            cancelText="Cancelar"
            confirmText={config.confirmText}
            onConfirm={handleWarningConfirm}
            isWarning={config.isWarning}
          />
        );
      })()}
      <AppModal
        show={showNameModal}
        onClose={() => {
          setShowNameModal(false);
          setCronogramaNombre('');
        }}
        title="Guardar cronograma"
        message="Ingresa un nombre para este cronograma:"
        cancelText="Cancelar"
        confirmText="Guardar"
        onConfirm={handleGuardarConNombre}
        isWarning={false}
        showInput={true}
        inputValue={cronogramaNombre}
        inputPlaceholder="Nombre del cronograma"
        onInputChange={setCronogramaNombre}
      />
      <AppModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Cronograma guardado"
        message="El cronograma se ha guardado exitosamente en tu perfil."
        cancelText=""
        confirmText="Aceptar"
        onConfirm={() => setShowSuccessModal(false)}
        isWarning={false}
      />
      <AppModal
        show={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Información"
        message={infoModalMessage}
        cancelText=""
        confirmText="Aceptar"
        onConfirm={() => setShowInfoModal(false)}
        isWarning={false}
      />
      <AppModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorModalMessage}
        cancelText=""
        confirmText="Aceptar"
        onConfirm={() => setShowErrorModal(false)}
        isWarning={true}
      />
    </>
  )
}
