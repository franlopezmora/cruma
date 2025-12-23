import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Spinner,
  Container,
  Row,
  Col,
  InputGroup
} from "react-bootstrap";
import AppButton from "../components/AppButton";
import {
  saveCarreraSelected,
  saveCuatrimestreSelected,
  saveMateriasSelected,
  getCarreraSelected,
  getCuatrimestreSelected,
  getMateriasSelected,
  clearAllAppData
} from "../utils/localStorage";
import AppModal from "../components/AppModal";
import { Calendar } from "lucide-react";

export default function SeleccionarMaterias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCuatri, setSelectedCuatri] = useState(null);
  const [selectedCarreraId, setSelectedCarreraId] = useState("");
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedAnio, setSelectedAnio] = useState("");
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigate = useNavigate();

  // Hook para detectar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // 🔥 Función para normalizar texto removiendo tildes
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // 🔥 Función para convertir números a ordinales
  const numeroAOrdinal = (numero) => {
    const ordinales = {
      1: '1er',
      2: '2do',
      3: '3er',
      4: '4to',
      5: '5to',
      6: '6to',
      7: '7mo',
      8: '8vo',
      9: '9no',
      10: '10mo'
    };
    return ordinales[numero] || `${numero}°`;
  };

  // 🔥 Cargar carreras al montar
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${apiUrl}/api/carreras`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener carreras");
        return res.json();
      })
      .then((data) => setCarreras(data))
      .catch((err) => {
        console.error(err);
        setIsError(true);
      });
  }, []);

  // 🔥 Cargar datos guardados al montar
  useEffect(() => {
    const savedCarrera = getCarreraSelected();
    const savedCuatri = getCuatrimestreSelected();

    // Establecer todos los datos de una vez para evitar efectos intermedios
    if (savedCarrera) {
      setSelectedCarreraId(savedCarrera);
    }
    if (savedCuatri) {
      setSelectedCuatri(Number(savedCuatri));
      // Cargar las materias del cuatrimestre guardado
      const savedMaterias = getMateriasSelected(Number(savedCuatri));
      if (savedMaterias && savedMaterias.length > 0) {
        setSelectedIds(savedMaterias);
      }
    }

    // Pequeño delay para asegurar que los estados se establezcan
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 50);
  }, []);

  // 🔥 Controlar cambios de carrera para limpiar datos solo cuando el usuario cambia manualmente
  const [previousCarrera, setPreviousCarrera] = useState(null);
  const [previousCuatri, setPreviousCuatri] = useState(null);

  // Inicializar los valores previos después de la carga inicial
  useEffect(() => {
    if (!isInitialLoad) {
      setPreviousCarrera(selectedCarreraId);
      setPreviousCuatri(selectedCuatri !== null ? Number(selectedCuatri) : null);
    }
  }, [isInitialLoad, selectedCarreraId, selectedCuatri]);

  // 🔥 Controlar cambios de carrera - solo cuando el usuario cambia manualmente
  useEffect(() => {
    if (!isInitialLoad && previousCarrera !== null && selectedCarreraId && selectedCarreraId !== previousCarrera) {
      setSelectedCuatri(null);
      setSearchTerm("");
      setSelectedIds([]);
      setMaterias([]);
      setPreviousCarrera(selectedCarreraId);
      // Guardar carrera seleccionada
      saveCarreraSelected(selectedCarreraId);
      setSaveMessage("Carrera guardada");
      setShowSaveIndicator(true);
    }
  }, [selectedCarreraId, isInitialLoad, previousCarrera]);

  // 🔥 Controlar cambios de cuatrimestre - solo cuando el usuario cambia manualmente
  useEffect(() => {
    if (!isInitialLoad && previousCuatri !== null && selectedCuatri && selectedCuatri !== previousCuatri) {
      setSearchTerm("");
      // NO borrar las materias seleccionadas, solo cargar las del nuevo cuatrimestre
      // Cargar las materias guardadas para el nuevo cuatrimestre
      const savedMaterias = getMateriasSelected(Number(selectedCuatri));
      setSelectedIds(savedMaterias || []);
      setMaterias([]);
      setPreviousCuatri(Number(selectedCuatri));
      // Guardar cuatrimestre seleccionado
      saveCuatrimestreSelected(Number(selectedCuatri));
      setSaveMessage("Cuatrimestre guardado");
      setShowSaveIndicator(true);
    }
  }, [selectedCuatri, isInitialLoad, previousCuatri]);

  // 🔥 Guardar materias cuando el usuario hace cambios manuales (con el cuatrimestre actual)
  useEffect(() => {
    if (!isInitialLoad && selectedCuatri && selectedIds.length >= 0) {
      saveMateriasSelected(selectedIds, selectedCuatri);
      if (selectedIds.length > 0) {
        setSaveMessage(`${selectedIds.length} materia(s) guardada(s)`);
      } else {
        setSaveMessage("Materias deseleccionadas");
      }
      setShowSaveIndicator(true);
      // Ocultar el indicador después de 2 segundos
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }
  }, [selectedIds, selectedCuatri, isInitialLoad]);

  // 🔥 Cargar materias cuando haya carrera y cuatrimestre seleccionados
  useEffect(() => {
    if (!selectedCuatri || !selectedCarreraId) {
      setMaterias([]);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    Promise.all([
      fetch(`${apiUrl}/api/materias/filtrar?carreraId=${selectedCarreraId}&periodoId=${selectedCuatri}`),
      fetch(`${apiUrl}/api/materias/filtrar?carreraId=${selectedCarreraId}&periodoId=0`)
    ])
      .then(([resCuatri, resAnuales]) => {
        if (!resCuatri.ok || !resAnuales.ok) throw new Error();
        return Promise.all([resCuatri.json(), resAnuales.json()]);
      })
      .then(([porCuatri, anuales]) => {
        const mapa = new Map();
        anuales.concat(porCuatri).forEach(m => mapa.set(m.id, m));
        setMaterias(Array.from(mapa.values()));
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [selectedCuatri, selectedCarreraId]);

  // 🔎 Filtrar materias en base al término de búsqueda
  const filteredMaterias = useMemo(() => {
    let results = materias;

    if (selectedAnio) {
      results = results.filter(m => m.anioCarrera === Number(selectedAnio));
    }

    const term = normalizarTexto(searchTerm.trim());
    if (term) {
      results = results.filter(m => {
        const nombreNormalizado = normalizarTexto(m.nombre);
        const codigoNormalizado = normalizarTexto(m.codigo);

        const nombreWords = nombreNormalizado.split(/\s+/);
        const codigoWords = codigoNormalizado.split(/\s+/);

        const matchNombre = nombreWords.some(w => w.startsWith(term));
        const matchCodigo = codigoWords.some(w => w.startsWith(term));

        return matchNombre || matchCodigo;
      });
    }

    // Ordenar por año y luego por código
    return results.sort((a, b) => {
      if (a.anioCarrera !== b.anioCarrera) {
        return a.anioCarrera - b.anioCarrera;
      }
      return a.codigo.localeCompare(b.codigo);
    });
  }, [materias, selectedAnio, searchTerm]);

  const anios = useMemo(() => {
    const setAnios = new Set(materias.map(m => m.anioCarrera));
    return Array.from(setAnios).sort((a, b) => a - b);
  }, [materias]);

  const selectedMaterias = useMemo(
    () => materias.filter((m) => selectedIds.includes(m.id)),
    [materias, selectedIds]
  );

  const handleRemove = useCallback((id) => {
    setSelectedIds((prev) => {
      const newIds = prev.filter((i) => i !== id);
      return newIds;
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedIds.length) return;
      const qMat = selectedIds.join(",");
      navigate(`/armar?materiaIds=${qMat}&cuatri=${selectedCuatri}`);
    },
    [selectedIds, selectedCuatri, navigate]
  );

  const handleClearAllData = useCallback(() => {
    setShowClearModal(true);
  }, []);

  const confirmClearAllData = useCallback(() => {
    clearAllAppData();
    setSelectedCarreraId("");
    setSelectedCuatri(null);
    setSelectedIds([]);
    setSearchTerm("");
    setMaterias([]);
    setShowClearModal(false);
  }, []);


  return (
    <>
      <div className="orbits" aria-hidden="true">
        <div className="orbit o1"></div>
        <div className="orbit o2"></div>
        <div className="orbit o3"></div>
      </div>
      <Container className="py-3" style={{ minHeight: '50vh', transition: 'all 0.3s ease', paddingBottom: '0.5rem' }}>
        {/* Botones justo debajo del header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.75rem', paddingTop: '0.25rem' }}>
          <AppButton
            variant="danger"
            size="sm"
            onClick={handleClearAllData}
            title="Limpiar todos los datos guardados"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <path d="M30 6.749h-5.331l-3.628-5.442c-0.228-0.337-0.609-0.556-1.041-0.557h-8c-0 0-0 0-0 0-0.432 0-0.813 0.219-1.037 0.552l-0.003 0.004-3.628 5.442h-5.332c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h2.858l1.897 20.864c0.060 0.64 0.594 1.137 1.245 1.137 0 0 0 0 0.001 0h16c0 0 0 0 0 0 0.65 0 1.184-0.497 1.243-1.132l0-0.005 1.897-20.864h2.859c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM12.669 3.25h6.661l2.333 3.499h-11.327zM22.859 28.75h-13.718l-1.772-19.5 17.262-0.001zM11 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM16 10.75c-0.69 0-1.25 0.56-1.25 1.25v0 14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c0-0.69-0.56-1.25-1.25-1.25v0zM21 10.75c-0.69 0-1.25 0.56-1.25 1.25v14c0 0.69 0.56 1.25 1.25 1.25s1.25-0.56 1.25-1.25v0-14c-0-0.69-0.56-1.25-1.25-1.25h-0z" />
            </svg>
            Limpiar
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
          >
            ← Volver al Home
          </AppButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="mb-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '2rem', marginBottom: '0.25rem' }}>
              <svg width="35" height="35" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(3px)' }}>
                <path d="M229.75146,196.61035l-8.28173-30.9082-.00049-.00195-.00049-.00184L196.62256,72.97217v-.00086l-8.28223-30.90979a12.00916,12.00916,0,0,0-14.69678-8.48437l-30.90966,8.28222a11.99256,11.99256,0,0,0-3.61182,1.656A12.01237,12.01237,0,0,0,128,36H96a11.93662,11.93662,0,0,0-8,3.081A11.93662,11.93662,0,0,0,80,36H48A12.01343,12.01343,0,0,0,36,48V208a12.01343,12.01343,0,0,0,12,12H80a11.93662,11.93662,0,0,0,8-3.08105A11.93662,11.93662,0,0,0,96,220h32a12.01343,12.01343,0,0,0,12-12V78.02l2.53027,9.44373.00049.00109.00049.00122,24.84619,92.72706v.00122l.00049.00146,8.28174,30.90772a11.98984,11.98984,0,0,0,14.69678,8.48535l30.90966-8.28223a11.99918,11.99918,0,0,0,8.48535-14.69629ZM151.293,89.25781,189.93066,78.9054l22.77588,85.00207-38.63672,10.353ZM96,44h32a4.00427,4.00427,0,0,1,4,4V172H92V48A4.00427,4.00427,0,0,1,96,44ZM48,44H80a4.00427,4.00427,0,0,1,4,4V76H44V48A4.00427,4.00427,0,0,1,48,44ZM80,212H48a4.00427,4.00427,0,0,1-4-4V84H84V208A4.00427,4.00427,0,0,1,80,212Zm48,0H96a4.00427,4.00427,0,0,1-4-4V180h40v28A4.00427,4.00427,0,0,1,128,212ZM142.37549,51.4502a3.97587,3.97587,0,0,1,2.4292-1.86426l30.90918-8.28223a3.99814,3.99814,0,0,1,4.89892,2.82813l7.24756,27.04687L149.22266,81.53113l-7.24659-27.04578A3.9718,3.9718,0,0,1,142.37549,51.4502Zm79.249,150.26562a3.97594,3.97594,0,0,1-2.4292,1.86426l-30.90918,8.28222a4.00907,4.00907,0,0,1-4.89892-2.8291l-7.24707-27.04614,38.63672-10.353,7.24707,27.04663A3.97183,3.97183,0,0,1,221.62451,201.71582Z" />
              </svg>
              Seleccionar Materias
            </h1>
            <h3 className="mb-2" style={{ fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '400' }}>Elegí las materias que vas a cursar este cuatrimestre</h3>
          </div>
        </div>

        <div style={{ minHeight: 'auto' }}>
          <Form.Group className="mb-2" controlId="carreraSelect" style={{ padding: "2px", marginBottom: "1rem" }}>
            <Form.Label style={{ paddingRight: "10px" }}><strong>Carrera:</strong></Form.Label>
            <Form.Select
              value={selectedCarreraId}
              onChange={e => setSelectedCarreraId(e.target.value)}
              className="custom-select"
              style={{
                width: "350px",
                height: "35px",
                textAlign: "center",
                paddingLeft: "12px",
                borderRadius: "6px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                cursor: "pointer",
                fontWeight: "400"
              }}
            >
              <option value="" disabled hidden>Seleccioná una carrera</option>
              {carreras
                .map(c => (
                  <option key={c.id} value={c.id} disabled={c.id !== 1}>
                    {c.codigo} – {c.nombre}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <div
            style={{
              opacity: selectedCarreraId ? 1 : 0.55,
              transition: 'opacity 0.2s ease',
              pointerEvents: selectedCarreraId ? 'auto' : 'none',
              minHeight: 'auto',
              marginBottom: '1.25rem'
            }}
          >
            {selectedCarreraId && (
              <Row className="mb-3 align-items-center">
                <Col xs="auto"><strong>Cuatrimestre:</strong></Col>
                <Col>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "10px", justifyContent: "center" }}>
                    {[1, 2].map(n => {
                      const isActive = Number(selectedCuatri) === n;
                      return (
                        <AppButton
                          key={n}
                          onClick={() => setSelectedCuatri(Number(n))}
                          variant={isActive ? "primary" : "default"}
                          style={{
                            width: "3rem",
                            minWidth: "3rem",
                            background: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                            color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                            border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--border-color)'
                          }}
                        >
                          {n}
                        </AppButton>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            )}
          </div>

          <div
            style={{
              opacity: selectedCuatri ? 1 : 0.55,
              transition: 'opacity 0.2s ease',
              pointerEvents: selectedCuatri ? 'auto' : 'none',
              minHeight: 'auto'
            }}
          >
            {selectedCuatri && (
              <>
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "center",
                  alignItems: isMobile ? "center" : "flex-start",
                  gap: isMobile ? "0" : "15px",
                  marginTop: isMobile ? "0.35rem" : "1.5rem"
                }}>
                  <div style={{
                    flex: "0 0 400px",
                    width: "400px",
                    maxWidth: "100%",
                    marginBottom: isMobile ? "0" : "0"
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <Form.Group className="d-flex align-items-center mb-0">
                        <Form.Select
                          value={selectedAnio}
                          onChange={e => setSelectedAnio(e.target.value)}
                          className="custom-select"
                          style={{
                            width: "90px",
                            height: "35px",
                            textAlign: "left",
                            paddingLeft: "8px",
                            borderRadius: "6px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            fontWeight: "400"
                          }}
                        >
                          <option value="">Todos</option>
                          {anios.map(a => <option key={a} value={a}>{numeroAOrdinal(a)}</option>)}
                        </Form.Select>
                      </Form.Group>
                      <div style={{
                        position: "relative",
                        width: "320px",
                        display: "flex",
                        alignItems: "center"
                      }}>
                        <div style={{
                          position: "absolute",
                          top: "50%",
                          left: "12px",
                          zIndex: 1,
                          color: "var(--text-secondary)",
                          pointerEvents: "none",
                          transform: "translateY(-45%)"
                        }}>
                          <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 13.024q0-2.624 1.024-5.056t2.784-4.16 4.16-2.752 5.056-1.056q2.656 0 5.056 1.056t4.16 2.752 2.784 4.16 1.024 5.056q0 3.616-1.984 6.816l7.072 7.040q0.864 0.896 0.864 2.144t-0.864 2.112-2.144 0.864-2.112-0.864l-7.040-7.040q-3.2 1.952-6.816 1.952-2.656 0-5.056-1.024t-4.16-2.784-2.784-4.128-1.024-5.088zM4 13.024q0 2.464 1.216 4.544t3.296 3.264 4.512 1.216q1.824 0 3.488-0.704t2.88-1.92 1.92-2.88 0.736-3.52-0.736-3.52-1.92-2.848-2.88-1.92-3.488-0.736q-2.432 0-4.512 1.216t-3.296 3.296-1.216 4.512z" />
                          </svg>
                        </div>
                        <Form.Control
                          placeholder={isSearchFocused ? "" : "Buscar materias por código o nombre..."}
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                          style={{
                            height: "31px",
                            width: "100%",
                            borderRadius: "6px",
                            textAlign: "left",
                            paddingLeft: "40px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem"
                          }}
                        />
                      </div>
                    </div>

                    {isLoading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px"
                      }}>
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <div
                        style={{
                          maxHeight: "220px",
                          overflowY: "auto",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          padding: "6px",
                          backgroundColor: "var(--bg-secondary)",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                          transition: "box-shadow 0.2s ease, border-color 0.2s ease"
                        }}
                      >
                        {filteredMaterias.length === 0 ? (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '200px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem'
                          }}>
                            ❌ No hay materias que coincidan.
                          </div>
                        ) : (
                          (() => {
                            const groupedMaterias = {};
                            filteredMaterias.forEach(m => {
                              if (!groupedMaterias[m.anioCarrera]) {
                                groupedMaterias[m.anioCarrera] = [];
                              }
                              groupedMaterias[m.anioCarrera].push(m);
                            });

                            return Object.keys(groupedMaterias)
                              .sort((a, b) => Number(a) - Number(b))
                              .map(anio => {
                                const anioNum = Number(anio);
                                const anioTexto = `${numeroAOrdinal(anioNum)} Año`;

                                return (
                                  <div key={anio}>
                                    <div style={{
                                      backgroundColor: 'var(--bg-tertiary)',
                                      color: 'var(--text-primary)',
                                      padding: '0.5rem 0.75rem',
                                      margin: '0px 0 0.5rem 0',
                                      fontSize: '0.8125rem',
                                      fontWeight: 600,
                                      borderBottom: '1px solid var(--border-color)',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}>
                                      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                        <path d="M229.75146,196.61035l-8.28173-30.9082-.00049-.00195-.00049-.00184L196.62256,72.97217v-.00086l-8.28223-30.90979a12.00916,12.00916,0,0,0-14.69678-8.48437l-30.90966,8.28222a11.99256,11.99256,0,0,0-3.61182,1.656A12.01237,12.01237,0,0,0,128,36H96a11.93662,11.93662,0,0,0-8,3.081A11.93662,11.93662,0,0,0,80,36H48A12.01343,12.01343,0,0,0,36,48V208a12.01343,12.01343,0,0,0,12,12H80a11.93662,11.93662,0,0,0,8-3.08105A11.93662,11.93662,0,0,0,96,220h32a12.01343,12.01343,0,0,0,12-12V78.02l2.53027,9.44373.00049.00109.00049.00122,24.84619,92.72706v.00122l.00049.00146,8.28174,30.90772a11.98984,11.98984,0,0,0,14.69678,8.48535l30.90966-8.28223a11.99918,11.99918,0,0,0,8.48535-14.69629ZM151.293,89.25781,189.93066,78.9054l22.77588,85.00207-38.63672,10.353ZM96,44h32a4.00427,4.00427,0,0,1,4,4V172H92V48A4.00427,4.00427,0,0,1,96,44ZM48,44H80a4.00427,4.00427,0,0,1,4,4V76H44V48A4.00427,4.00427,0,0,1,48,44ZM80,212H48a4.00427,4.00427,0,0,1-4-4V84H84V208A4.00427,4.00427,0,0,1,80,212Zm48,0H96a4.00427,4.00427,0,0,1-4-4V180h40v28A4.00427,4.00427,0,0,1,128,212ZM142.37549,51.4502a3.97587,3.97587,0,0,1,2.4292-1.86426l30.90918-8.28223a3.99814,3.99814,0,0,1,4.89892,2.82813l7.24756,27.04687L149.22266,81.53113l-7.24659-27.04578A3.9718,3.9718,0,0,1,142.37549,51.4502Zm79.249,150.26562a3.97594,3.97594,0,0,1-2.4292,1.86426l-30.90918,8.28222a4.00907,4.00907,0,0,1-4.89892-2.8291l-7.24707-27.04614,38.63672-10.353,7.24707,27.04663A3.97183,3.97183,0,0,1,221.62451,201.71582Z" />
                                      </svg>
                                      {anioTexto}
                                    </div>
                                    {groupedMaterias[anio].map(m => {
                                      const isSelected = selectedIds.includes(m.id);
                                      return (
                                        <div
                                          key={m.id}
                                          onClick={() => {
                                            setSelectedIds((prev) => {
                                              if (prev.includes(m.id)) {
                                                return prev.filter((i) => i !== m.id);
                                              } else {
                                                return [...prev, m.id];
                                              }
                                            });
                                          }}
                                          style={{
                                            padding: "8px 12px",
                                            marginBottom: "4px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            backgroundColor: isSelected ? "var(--bg-tertiary)" : "transparent",
                                            border: isSelected ? "1px solid var(--border-color)" : "1px solid transparent",
                                            color: "var(--text-primary)",
                                            fontSize: "0.875rem",
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            userSelect: "none"
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                                              e.currentTarget.style.borderColor = "var(--border-color)";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.backgroundColor = "transparent";
                                              e.currentTarget.style.borderColor = "transparent";
                                            }
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: "18px",
                                              height: "18px",
                                              borderRadius: "4px",
                                              border: "2px solid var(--border-color)",
                                              backgroundColor: isSelected ? "var(--bg-primary)" : "transparent",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              flexShrink: 0,
                                              transition: "all 0.2s ease"
                                            }}
                                          >
                                            {isSelected && (
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                              </svg>
                                            )}
                                          </div>
                                          <span style={{ flex: 1, textAlign: 'left' }}>
                                            {`${m.codigo} – ${m.nombre}`}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              });
                          })()
                        )}
                      </div>
                    )}
                  </div>

                  {/* Panel lateral de seleccionadas */}
                  <div style={{
                    flex: "0 0 400px",
                    width: "400px",
                    maxWidth: "100%",
                    order: isMobile ? 2 : 1,
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    {!isMobile && <div style={{ height: "11px" }}></div>}
                    <h2 style={{ color: "var(--text-primary)", textAlign: "center", marginBottom: "10px", marginTop: isMobile ? "0.25rem" : "0px", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <path d="M15.9894 4.9502L16.52 4.42014L16.52 4.42014L15.9894 4.9502ZM19.0717 8.03562L18.5411 8.56568L18.5411 8.56568L19.0717 8.03562ZM8.73845 19.429L8.20785 19.9591L8.73845 19.429ZM4.62176 15.3081L5.15236 14.7781L4.62176 15.3081ZM17.567 14.9943L17.3032 14.2922L17.567 14.9943ZM15.6499 15.7146L15.9137 16.4167L15.6499 15.7146ZM8.33227 8.38177L7.62805 8.12375H7.62805L8.33227 8.38177ZM9.02673 6.48636L9.73095 6.74438L9.02673 6.48636ZM5.84512 10.6735L6.04445 11.3965H6.04445L5.84512 10.6735ZM7.30174 10.1351L6.86354 9.52646L6.86354 9.52646L7.30174 10.1351ZM7.6759 9.79038L8.24673 10.2768H8.24673L7.6759 9.79038ZM14.2511 16.3805L14.7421 16.9475L14.7421 16.9475L14.2511 16.3805ZM13.3807 18.2012L12.6575 18.0022V18.0022L13.3807 18.2012ZM13.917 16.7466L13.3076 16.3094L13.3076 16.3094L13.917 16.7466ZM2.71854 12.7552L1.96855 12.76V12.76L2.71854 12.7552ZM2.93053 11.9521L2.28061 11.5778H2.28061L2.93053 11.9521ZM11.3053 21.3431L11.3064 20.5931H11.3064L11.3053 21.3431ZM12.0933 21.1347L11.7216 20.4833L11.7216 20.4833L12.0933 21.1347ZM11.6973 2.03606L11.8589 2.76845L11.6973 2.03606ZM15.4588 5.48026L18.5411 8.56568L19.6023 7.50556L16.52 4.42014L15.4588 5.48026ZM9.26905 18.8989L5.15236 14.7781L4.09116 15.8382L8.20785 19.9591L9.26905 18.8989ZM17.3032 14.2922L15.3861 15.0125L15.9137 16.4167L17.8308 15.6964L17.3032 14.2922ZM9.03649 8.63979L9.73095 6.74438L8.32251 6.22834L7.62805 8.12375L9.03649 8.63979ZM6.04445 11.3965C6.75591 11.2003 7.29726 11.0625 7.73995 10.7438L6.86354 9.52646C6.6906 9.65097 6.46608 9.72428 5.64578 9.95044L6.04445 11.3965ZM7.62805 8.12375C7.3351 8.92332 7.24345 9.14153 7.10507 9.30391L8.24673 10.2768C8.60048 9.86175 8.78237 9.33337 9.03649 8.63979L7.62805 8.12375ZM7.73995 10.7438C7.92704 10.6091 8.09719 10.4523 8.24673 10.2768L7.10507 9.30391C7.03377 9.38757 6.95268 9.46229 6.86354 9.52646L7.73995 10.7438ZM15.3861 15.0125C14.697 15.2714 14.1717 15.4571 13.7601 15.8135L14.7421 16.9475C14.9029 16.8082 15.1193 16.7152 15.9137 16.4167L15.3861 15.0125ZM14.1038 18.4001C14.3291 17.5813 14.4022 17.3569 14.5263 17.1838L13.3076 16.3094C12.9903 16.7517 12.853 17.2919 12.6575 18.0022L14.1038 18.4001ZM13.7601 15.8135C13.5904 15.9605 13.4385 16.1269 13.3076 16.3094L14.5263 17.1838C14.5888 17.0968 14.6612 17.0175 14.7421 16.9475L13.7601 15.8135ZM5.15236 14.7781C4.50623 14.1313 4.06806 13.691 3.78374 13.3338C3.49842 12.9753 3.46896 12.8201 3.46852 12.7505L1.96855 12.76C1.97223 13.3422 2.26135 13.8297 2.6101 14.2679C2.95984 14.7073 3.47123 15.2176 4.09116 15.8382L5.15236 14.7781ZM5.64578 9.95044C4.80056 10.1835 4.10403 10.3743 3.58304 10.5835C3.06349 10.792 2.57124 11.0732 2.28061 11.5778L3.58045 12.3264C3.61507 12.2663 3.717 12.146 4.14187 11.9755C4.56531 11.8055 5.16345 11.6394 6.04445 11.3965L5.64578 9.95044ZM3.46852 12.7505C3.46758 12.6016 3.50623 12.4553 3.58045 12.3264L2.28061 11.5778C2.07362 11.9372 1.96593 12.3452 1.96855 12.76L3.46852 12.7505ZM8.20785 19.9591C8.83172 20.5836 9.34472 21.0987 9.78654 21.4506C10.2271 21.8015 10.718 22.0922 11.3042 22.0931L11.3064 20.5931C11.237 20.593 11.0815 20.5644 10.7211 20.2773C10.3619 19.9912 9.91931 19.5499 9.26905 18.8989L8.20785 19.9591ZM12.6575 18.0022C12.4133 18.8897 12.2463 19.4924 12.0752 19.9188C11.9034 20.3467 11.7822 20.4487 11.7216 20.4833L12.4651 21.7861C12.9741 21.4956 13.2573 21.0004 13.4672 20.4775C13.6777 19.9532 13.8695 19.2516 14.1038 18.4001L12.6575 18.0022ZM11.3042 22.0931C11.7113 22.0937 12.1115 21.9879 12.4651 21.7861L11.7216 20.4833C11.5951 20.5555 11.452 20.5933 11.3064 20.5931L11.3042 22.0931ZM18.5411 8.56568C19.6046 9.63022 20.3403 10.3695 20.7918 10.9788C21.2353 11.5774 21.2864 11.8959 21.2322 12.1464L22.6983 12.4634C22.8882 11.5854 22.5383 10.8162 21.997 10.0857C21.4636 9.36592 20.6306 8.53486 19.6023 7.50556L18.5411 8.56568ZM17.8308 15.6964C19.1922 15.1849 20.2941 14.773 21.0771 14.3384C21.8719 13.8973 22.5084 13.3416 22.6983 12.4634L21.2322 12.1464C21.178 12.3968 21.0002 12.6655 20.3492 13.0268C19.6865 13.3946 18.7113 13.7632 17.3032 14.2922L17.8308 15.6964ZM16.52 4.42014C15.4841 3.3832 14.6481 2.54353 13.9246 2.00638C13.1909 1.46165 12.4175 1.10912 11.5357 1.30367L11.8589 2.76845C12.1086 2.71335 12.4278 2.7633 13.0305 3.21075C13.6434 3.66579 14.3877 4.40801 15.4588 5.48026L16.52 4.42014ZM9.73095 6.74438C10.2526 5.32075 10.6162 4.33403 10.9813 3.66315C11.3403 3.00338 11.6091 2.82357 11.8589 2.76845L11.5357 1.30367C10.6541 1.49819 10.1006 2.14332 9.6637 2.94618C9.23286 3.73793 8.82695 4.85154 8.32251 6.22834L9.73095 6.74438Z" />
                        <path opacity="0.5" d="M1.4694 21.4697C1.17666 21.7627 1.1769 22.2376 1.46994 22.5304C1.76298 22.8231 2.23786 22.8229 2.5306 22.5298L1.4694 21.4697ZM7.18383 17.8719C7.47657 17.5788 7.47633 17.1039 7.18329 16.8112C6.89024 16.5185 6.41537 16.5187 6.12263 16.8117L7.18383 17.8719ZM2.5306 22.5298L7.18383 17.8719L6.12263 16.8117L1.4694 21.4697L2.5306 22.5298Z" />
                      </svg>
                      Seleccionadas
                    </h2>
                    <div style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      padding: "6px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      transition: "box-shadow 0.2s ease, border-color 0.2s ease"
                    }}>
                      {selectedMaterias.length === 0 ? (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '35px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.875rem'
                        }}>
                          No hay materias seleccionadas
                        </div>
                      ) : (
                        selectedMaterias.map(m => (
                          <div
                            key={m.id}
                            style={{
                              padding: "8px 12px",
                              marginBottom: "4px",
                              backgroundColor: "var(--bg-tertiary)",
                              borderRadius: "6px",
                              color: "var(--text-primary)",
                              transition: 'all 0.2s ease',
                              position: "relative",
                              border: "1px solid var(--border-color)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              paddingRight: "36px"
                            }}
                          >
                            <span style={{
                              color: "var(--text-primary)",
                              flex: "1",
                              textAlign: "left",
                              fontSize: "0.875rem"
                            }}>✅ {m.codigo} – {m.nombre}</span>
                            <AppButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemove(m.id)}
                              style={{
                                width: "20px",
                                height: "20px",
                                padding: "0",
                                fontSize: "0.7rem",
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                minWidth: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              ✕
                            </AppButton>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    opacity: selectedIds.length > 0 ? 1 : 0,
                    transform: selectedIds.length > 0 ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    marginTop: isMobile ? '0.35rem' : '1.5rem',
                    marginBottom: isMobile ? '0.25rem' : '0.5rem',
                    height: isMobile ? 'auto' : '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AppButton
                    onClick={handleSubmit}
                    variant="primary"
                    style={{
                      visibility: selectedIds.length > 0 ? 'visible' : 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Calendar size={18} strokeWidth={2} />
                    Armar Cronograma
                  </AppButton>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
      <AppModal
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Limpiar datos"
        message="¿Estás seguro de que quieres limpiar todos los datos guardados? Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Limpiar"
        onConfirm={confirmClearAllData}
        isWarning={true}
      />
    </>
  );
}
