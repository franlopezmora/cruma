import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Spinner,
  Container,
  Row,
  Col,
  InputGroup
} from "react-bootstrap";
import { 
  saveCarreraSelected, 
  saveCuatrimestreSelected, 
  saveMateriasSelected,
  getCarreraSelected,
  getCuatrimestreSelected,
  getMateriasSelected,
  clearAllAppData
} from "../utils/localStorage";
import AutoSaveIndicator from "../components/AutoSaveIndicator";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();


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
    const savedMaterias = getMateriasSelected();
    
    // Establecer todos los datos de una vez para evitar efectos intermedios
    if (savedCarrera) {
      setSelectedCarreraId(savedCarrera);
    }
    if (savedCuatri) {
      setSelectedCuatri(savedCuatri);
    }
    if (savedMaterias && savedMaterias.length > 0) {
      setSelectedIds(savedMaterias);
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
      setPreviousCuatri(selectedCuatri);
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
      setSelectedIds([]);
      setMaterias([]);
      setPreviousCuatri(selectedCuatri);
      // Guardar cuatrimestre seleccionado
      saveCuatrimestreSelected(selectedCuatri);
      setSaveMessage("Cuatrimestre guardado");
      setShowSaveIndicator(true);
    }
  }, [selectedCuatri, isInitialLoad, previousCuatri]);

  // 🔥 Guardar materias cuando el usuario hace cambios manuales
  useEffect(() => {
    if (!isInitialLoad && selectedIds.length >= 0) {
      saveMateriasSelected(selectedIds);
      if (selectedIds.length > 0) {
        setSaveMessage(`${selectedIds.length} materia(s) guardada(s)`);
      } else {
        setSaveMessage("Materias deseleccionadas");
      }
      setShowSaveIndicator(true);
      // Ocultar el indicador después de 2 segundos
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }
  }, [selectedIds, isInitialLoad]);

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
  return Array.from(setAnios).sort((a,b) => a - b);
}, [materias]);

  const selectedMaterias = useMemo(
      () => materias.filter((m) => selectedIds.includes(m.id)),
      [materias, selectedIds]
  );

  const handleCheck = useCallback((e) => {
    const id = Number(e.target.value);
    setSelectedIds((prev) => {
      const newIds = e.target.checked ? [...prev, id] : prev.filter((i) => i !== id);
      return newIds;
    });
  }, []);

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
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos guardados? Esta acción no se puede deshacer.')) {
      clearAllAppData();
      setSelectedCarreraId("");
      setSelectedCuatri(null);
      setSelectedIds([]);
      setSearchTerm("");
      setMaterias([]);
      alert('Todos los datos han sido limpiados correctamente.');
    }
  }, []);


  return (
  <>
    <AutoSaveIndicator isVisible={showSaveIndicator} message={saveMessage} />
    <Container className="py-2" style={{ minHeight: '50vh', transition: 'all 0.3s ease' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <h1 className="mb-2">📚 Seleccionar Materias</h1>
        <h2 className="mb-3">Elegí las materias que vas a cursar este cuatrimestre</h2>
      </div>
      <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '1rem', top: '1rem' }}>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={handleClearAllData}
          style={{ fontSize: '0.7rem', padding: '4px 8px', height: 'fit-content' }}
          title="Limpiar todos los datos guardados"
        >
          🗑️ Limpiar
        </Button>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => navigate('/')}
          style={{ fontSize: '0.8rem', padding: '6px 12px', height: 'fit-content' }}
        >
          ← Volver al Home
        </Button>
      </div>
    </div>

    <div style={{ minHeight: '600px', transition: 'all 0.3s ease' }}>
      <Form.Group className="mb-2" controlId="carreraSelect" style={{ padding: "5px" }}>
        <Form.Label style={{ paddingRight: "10px" }}><strong>Carrera:</strong></Form.Label>
        <Form.Select
          value={selectedCarreraId}
          onChange={e => setSelectedCarreraId(e.target.value)}
          style={{ width: "300px", height: "35px", textAlign: "center", borderRadius: "10px" }}
        >
          <option value="" disabled hidden>-- Seleccioná una carrera --</option>
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
          opacity: selectedCarreraId ? 1 : 0.3,
          transform: selectedCarreraId ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease',
          minHeight: '100px'
        }}
      >
        {selectedCarreraId && (
          <Row className="mb-3 align-items-center">
            <Col xs="auto"><strong>Cuatrimestre:</strong></Col>
            <Col>
              <div style={{ display: "flex", gap: "5px", marginBottom: "10px", justifyContent: "center" }}>
                {[1, 2].map(n => (
                  <Button
                    key={n}
                    onClick={() => setSelectedCuatri(n)}
                    active={selectedCuatri === n}
                    variant={selectedCuatri === n ? "light" : "outline-light"}
                    style={{ 
                      width: "3rem",
                      border: selectedCuatri === n ? "2px solid white" : "1px solid #6c757d",
                      boxShadow: selectedCuatri === n ? "0 0 8px rgba(255, 255, 255, 0.5)" : "none"
                    }}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        )}
      </div>

      <div 
        style={{ 
          opacity: selectedCuatri ? 1 : 0.3,
          transform: selectedCuatri ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease',
          minHeight: '400px'
        }}
      >
        {selectedCuatri && (
          <>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px", minHeight: "300px" }}>
              <div style={{ flex: "0 0 400px" }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <Form.Group className="d-flex align-items-center mb-0">
                    <Form.Label className="me-2 mb-0"><strong>Año:</strong></Form.Label>
                    <Form.Select
                      value={selectedAnio}
                      onChange={e => setSelectedAnio(e.target.value)}
                      style={{ width: "70px", height: "35px", textAlign: "center", borderRadius: "10px" }}
                    >
                      <option value="">Todos</option>
                      {anios.map(a => <option key={a} value={a}>{numeroAOrdinal(a)}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <InputGroup style={{ width: "340px" }}>
                    <Form.Control
                      placeholder="Buscar materias por código o nombre..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ height: "35px", width: "80%", borderRadius: "10px", textAlign: "center", transform: "translateY(10px)" }}
                    />
                    <InputGroup.Text style={{ fontSize: "1.25rem", position: "relative", top: "10px" }}>🔍</InputGroup.Text>
                  </InputGroup>
                </div>
                
                {isLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px',
                    backgroundColor: "#333",
                    border: "1px solid #666",
                    borderRadius: "5px"
                  }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <div 
                    style={{ 
                      maxHeight: "300px", 
                      overflowY: "auto",
                      border: "1px solid #666",
                      borderRadius: "5px",
                      padding: "8px",
                      backgroundColor: "#333",
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {filteredMaterias.length === 0 ? (
                      <p className="text-muted">❌ No hay materias que coincidan.</p>
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
                              backgroundColor: '#444',
                              color: '#fff',
                              padding: '4px 8px',
                              margin: '0px 0 2px 0',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #666'
                            }}>
                              📚 {anioTexto}
                            </div>
                          {groupedMaterias[anio].map(m => (
                            <Form.Check
                              key={m.id}
                              type="checkbox"
                              id={`materia-${m.id}`}
                              label={
                                <span 
                                  style={{ 
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "normal"
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const isCurrentlySelected = selectedIds.includes(m.id);
                                    const mockEvent = {
                                      target: {
                                        value: m.id,
                                        checked: !isCurrentlySelected
                                      }
                                    };
                                    handleCheck(mockEvent);
                                  }}
                                >
                                  {`${m.codigo} – ${m.nombre}`}
                                </span>
                              }
                              value={m.id}
                              checked={selectedIds.includes(m.id)}
                              onChange={handleCheck}
                              onMouseDown={e => e.preventDefault()}
                              className="mb-1"
                              style={{ 
                                padding: "2px",
                                color: "#fff"
                              }}
                            />
                          ))}
                        </div>
                      );
                    });
                  })()
                )}
                  </div>
                )}
              </div>

              {/* Panel lateral de seleccionadas */}
              <div style={{ flex: "0 0 400px" }}>
                <h2 style={{color: "#333", textAlign: "center", marginBottom: "15px", marginTop: "18px"}}>📌 Seleccionadas</h2>
                <div style={{
                  backgroundColor: "#333",
                  border: "1px solid #666",
                  borderRadius: "5px",
                  padding: "8px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  transition: 'all 0.3s ease'
                }}>
                  {selectedMaterias.length === 0 ? (
                    <p style={{color: "#fff", textAlign: "center", marginTop: "20px"}}>No hay materias seleccionadas</p>
                  ) : (
                    selectedMaterias.map(m => (
                      <div
                        key={m.id}
                        className="d-flex justify-content-between align-items-center"
                        style={{ 
                          minHeight: "35px",
                          padding: "5px 4px",
                          marginBottom: "5px",
                          backgroundColor: "#444",
                          borderRadius: "3px",
                          color: "#fff",
                          transition: 'all 0.2s ease',
                          position: "relative"
                        }}
                      >
                        <span style={{ 
                          color: "#fff", 
                          flex: "1", 
                          textAlign: "left",
                          lineHeight: "33px"
                        }}>✅ {m.codigo} – {m.nombre}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemove(m.id)}
                          style={{
                            width: "24px", 
                            height: "24px", 
                            padding: "0", 
                            fontSize: "0.7rem",
                            color: "#fff",
                            backgroundColor: "#dc3545",
                            borderColor: "#dc3545",
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translateY(-50%)"
                          }}
                        >
                          ✕
                        </Button>
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
                marginTop: '20px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Button
                onClick={handleSubmit}
                className="mt-3"
                style={{ 
                  padding: "0.75rem 1.5rem", 
                  marginTop: "20px",
                  visibility: selectedIds.length > 0 ? 'visible' : 'hidden'
                }}
              >
                🚀 Armar Cronograma
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  </Container>
  </>
);
}
