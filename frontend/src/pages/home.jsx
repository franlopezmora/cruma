import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  ListGroup,
  InputGroup,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCuatri, setSelectedCuatri] = useState(null);
  const [selectedCarreraId, setSelectedCarreraId] = useState("");
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedAnio, setSelectedAnio] = useState("");

  const navigate = useNavigate();

  // 🔥 Cargar carreras al montar
  useEffect(() => {
    fetch("/api/carreras")
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

  useEffect(() => {
    setSelectedCuatri(null);
    setSearchTerm("");
    setSelectedIds([]);
    setMaterias([]);
  }, [selectedCarreraId]);

  useEffect(() => {
    setSearchTerm("");
    setSelectedIds([]);
    setMaterias([]);
  }, [selectedCuatri]);


  // 🔥 Cargar materias cuando haya carrera y cuatrimestre seleccionados
  useEffect(() => {
    if (!selectedCuatri || !selectedCarreraId) {
      setMaterias([]);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    Promise.all([
      fetch(`/api/materias/filtrar?carreraId=${selectedCarreraId}&periodoId=${selectedCuatri}`),
      fetch(`/api/materias/filtrar?carreraId=${selectedCarreraId}&periodoId=0`)
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

  const term = searchTerm.trim().toLowerCase();
  if (term) {
    results = results.filter(m => {
      const nombreWords = m.nombre.toLowerCase().split(/\s+/);
      const codigoWords = m.codigo.toLowerCase().split(/\s+/);

      const matchNombre = nombreWords.some(w => w.startsWith(term));
      const matchCodigo = codigoWords.some(w => w.startsWith(term));

      return matchNombre || matchCodigo;
    });
  }

  return results;
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
    setSelectedIds((prev) =>
        e.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
    setSearchTerm("");
  }, []);

  const handleRemove = useCallback((id) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
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

  return (
  <Container className="py-4">
    <h1 className="mb-3">🎓 Bienvenido a Cruma</h1>
    <h2 className="mb-4">Seleccioná las materias que vas a cursar</h2>

    <Form.Group className="mb-3" controlId="carreraSelect" style={{ padding: "10px" }}>
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

    {selectedCarreraId && (
      <>
        <Row className="mb-3 align-items-center">
          <Col xs="auto"><strong>Cuatrimestre:</strong></Col>
          <Col>
            <ButtonGroup style={{ marginBottom: "20px" }}>
              {[1, 2].map(n => (
                <Button
                  key={n}
                  onClick={() => setSelectedCuatri(n)}
                  active={selectedCuatri === n}
                  variant={selectedCuatri === n ? "light" : "outline-light"}
                  style={{ width: "3rem" }}
                >
                  {n}
                </Button>
              ))}
            </ButtonGroup>
          </Col>
        </Row>

    {selectedCuatri && (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: '0.75rem',
            marginBottom: '1rem',            
          justifyContent: 'center'
          }}
        >
          <Form.Group className="d-flex align-items-center me-3 mb-0">
            <Form.Label className="me-2 mb-0"><strong>Año:</strong></Form.Label>
            <Form.Select
              value={selectedAnio}
              onChange={e => setSelectedAnio(e.target.value)}
              style={{ width: "70px", height: "35px", textAlign: "center", borderRadius: "10px", marginLeft: "10px" }}
            >
              <option value="">Todos</option>
              {anios.map(a => <option key={a} value={a}>{a}</option>)}
            </Form.Select>
          </Form.Group>
          <InputGroup className="flex-grow-1">
            <Form.Control
              placeholder="Buscar materias por código o nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ height: "35px", width: "280px", borderRadius: "10px", textAlign: "center" }}
            />
            <InputGroup.Text style={{ fontSize: "1.25rem" }}>🔍</InputGroup.Text>
          </InputGroup>
        </div>

            {searchTerm.trim() !== "" && (
              <div className="mt-3" style={{ padding: "10px" }}>
                {filteredMaterias.length === 0 ? (
                  <p className="text-muted">❌ No hay materias que coincidan.</p>
                ) : (
                  filteredMaterias.map(m => (
                    <Form.Check
                      key={m.id}
                      type="checkbox"
                      id={`materia-${m.id}`}
                      label={`${m.codigo} – ${m.nombre} \u00A0 (Año ${m.anioCarrera})`}
                      value={m.id}
                      checked={selectedIds.includes(m.id)}
                      onChange={handleCheck}
                      onMouseDown={e => e.preventDefault()}
                      className="mb-2"
                      style={{ padding: "3px" }}
                    />
                  ))
                )}
              </div>
            )}

          {/* Panel lateral de seleccionadas */}
          {selectedMaterias.length > 0 && (
            <Col md={4}>
              <h2 className="mt-4" style={{marginTop: "80px"}}>📌 Seleccionadas</h2>
              <ListGroup>
                {selectedMaterias.map(m => (
                  <ListGroup.Item
                    key={m.id}
                    className="d-flex justify-content-between align-items-center"
                    style={{ minHeight: "45px" }}
                  >
                    <span>✅ {m.codigo} – {m.nombre}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemove(m.id)}
                      style={{marginLeft: "10px"}}
                    >
                      ❌
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          )}

        {selectedIds.length > 0 && (
          <Button
            onClick={handleSubmit}
            className="mt-3"
            style={{ padding: "0.75rem 1.5rem", marginTop: "20px" }}
          >
            🚀 Armar Cronograma
          </Button>
        )}
      </>
    )}

      </>
    )}
  </Container>
);}