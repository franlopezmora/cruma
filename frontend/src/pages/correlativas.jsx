import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Materia, next } from "../utils/auxiliaresCorrelativas";
import { Columna } from "../components/columnaMateria";
import './css/correlativas.css';
import { useNavigate } from "react-router-dom";
import { useCorrelativasModel } from "../hooks/useCorrelativasModel";
import { useAuth } from "../contexts/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { fetchEstadoCorrelativas, saveEstadoCorrelativas } from "../api/correlativas";
import { 
    getCorrelativasEstado, 
    saveCorrelativasEstado, 
    getCorrelativasCuatri, 
    saveCorrelativasCuatri 
} from "../utils/localStorage";
import AppButton from "../components/AppButton";
import AppModal from "../components/AppModal";
import { USE_MOCKS } from "../utils/env";
import { comisionesMock } from "../mocks/comisionesMock";

export const Correlativas = () => {
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [selectedCuatri, setSelectedCuatri] = useState(null);
    const { data } = useCorrelativasModel();
    const navigate = useNavigate('')
    const { isAuthenticated } = useAuth();
    const { handleApiError } = useErrorHandler();

    const [validando, setValidando] = useState(false);
    const [cargandoPersistencia, setCargandoPersistencia] = useState(false);
    const [guardandoEstado, setGuardandoEstado] = useState(false);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);


    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertModalMessage, setAlertModalMessage] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningModalMessage, setWarningModalMessage] = useState('');

    const localLoadedRef = useRef(false);

    useEffect(() => {
        if (!data) return;
        setSelectedMaterias(data.materiasInstanciadas);
    }, [data]);

    // Aplicar estado guardado en localStorage (solo una vez al cargar datos)
    useEffect(() => {
        if (localLoadedRef.current) return;
        if (!selectedMaterias.length) return;

        const savedEstado = getCorrelativasEstado();
        const savedCuatri = getCorrelativasCuatri();

        if (savedCuatri === 1 || savedCuatri === 2) {
            setSelectedCuatri(Number(savedCuatri));
        }

        if (Array.isArray(savedEstado) && savedEstado.length) {
            setSelectedMaterias(prev => prev.map(m => {
                const match = savedEstado.find(e => e.materiaId === m.id);
                if (!match || match.estado === undefined || match.estado === null) return m;
                return new Materia({ ...m, estado: match.estado });
            }));
        }

        localLoadedRef.current = true;
    }, [selectedMaterias]);

    // Persistir cambios de estado en localStorage
    useEffect(() => {
        if (!selectedMaterias.length) return;
        const payload = selectedMaterias.map(m => ({
            materiaId: m.id,
            estado: m.estado ?? 0
        }));
        saveCorrelativasEstado(payload);
    }, [selectedMaterias]);

    // Persistir cuatrimestre elegido
    useEffect(() => {
        if (!selectedCuatri) return;
        saveCorrelativasCuatri(Number(selectedCuatri));
    }, [selectedCuatri]);

    const aplicarEstadosPersistidos = useCallback((estadosDesdeBackend = []) => {
        if (!estadosDesdeBackend.length) return;
        setSelectedMaterias(prev => prev.map(m => {
            const match = estadosDesdeBackend.find(e => e.materiaId === m.id);
            if (!match || match.estado === undefined || match.estado === null) return m;
            return new Materia({ ...m, estado: match.estado });
        }));
    }, []);

    useEffect(() => {
        if (!data || !isAuthenticated) return;
        const cargarEstados = async () => {
            try {
                setCargandoPersistencia(true);
                const resp = await fetchEstadoCorrelativas();
                if (resp?.estados?.length) {
                    aplicarEstadosPersistidos(resp.estados);
                }
                setUltimaActualizacion(resp?.ultimaActualizacion || null);
            } catch (err) {
                console.error("Error cargando estados guardados de correlativas", err);
            } finally {
                setCargandoPersistencia(false);
            }
        };
        cargarEstados();
    }, [data, isAuthenticated, aplicarEstadosPersistidos]);


    const bolsas = useMemo(() => {
        console.log("Estamos dentro del useMemo de las bolsas con estas materias: ")
        console.log("selectedMaterias", selectedMaterias)
        if (selectedMaterias.length === 0) return { bolsaRegulares: [], bolsaAprobadas: [] };

        const bolsaAprobadas = selectedMaterias
            .filter(m => m.estado === 3)
            .map(m => m.id);

        const bolsaRegulares = selectedMaterias
            .filter(m => m.estado === 2 || m.estado === 3)
            .map(m => m.id);


        return { bolsaAprobadas, bolsaRegulares };
    }, [selectedMaterias]);

    const niveles = useMemo(() => {
        const groups = {};

        selectedMaterias.forEach(m => {
            const nv = m.electiva ? 'Electivas' : m.nivel;
            if (!groups[nv]) groups[nv] = [];
            groups[nv].push(m);
        });


        const { bolsaRegulares, bolsaAprobadas } = bolsas;

        const visibleGroups = {};
        Object.entries(groups).forEach(([nivel, mats]) => {
            const show = mats.some(mat =>
                mat.estado !== 0 || mat.validarCorrelativas(bolsaRegulares, bolsaAprobadas)
            );
            if (show) visibleGroups[nivel] = mats;
        });

        return visibleGroups;
    }, [selectedMaterias, bolsas]);
    const nivelesVisibles = useMemo(() => {
        const entries = Object.entries(niveles);

        return entries
            .filter(([nivel, mats]) => {
                if (String(nivel) === "1") return true;

                const visible = mats.some(m => {
                    if (m.estado === 1 || m.estado === 2 || m.estado === 3) return true;

                    return m.validarCorrelativas(bolsas.bolsaRegulares, bolsas.bolsaAprobadas);
                });

                return visible;
            })
            .sort(([a], [b]) => {
                if (a === "Electivas") return 1;
                if (b === "Electivas") return -1;
                return Number(a) - Number(b);
            });
    }, [niveles, bolsas]);
    useEffect(() => {
        console.log("Estamos dentro del useEffect de selectedMaterias")
        if (!selectedMaterias.length) return;

        const { bolsaRegulares, bolsaAprobadas } = bolsas;

        let changed = false;

        const nextList = selectedMaterias.map(m => {
            if (m.estado === 2 || m.estado === 3) return m;

            const cumple = m.validarCorrelativas(bolsaRegulares, bolsaAprobadas);

            if (cumple && m.estado === 0) {
                changed = true;
                return new Materia({ ...m, estado: 1 });
            }
            if (!cumple && m.estado === 1) {
                changed = true;
                return new Materia({ ...m, estado: 0 });
            }
            return m;
        });

        if (changed) setSelectedMaterias(nextList);
    }, [bolsas, selectedMaterias]);



    const puedeCursarIds = useMemo(() => {
        console.log("Estamos dentro del useMemo de puedeCursarIds")
        return selectedMaterias
            .filter((m) => m.estado === 1)
            .map((m) => m.id);
    }, [selectedMaterias]);
    console.log("Las materias  que puede cursar son ", puedeCursarIds)


    const handleMateriaClick = (materiaClickeada) => {
        setSelectedMaterias(prevMaterias => prevMaterias.map(m => {
            if (m.id === materiaClickeada.id) {
                console.log("m: ", m)
                console.log("materia clickeada: ", materiaClickeada)
                return new Materia({
                    ...m,
                    estado: next(m.estado),
                });
            }
            return m;
        }));
    };

    const actualizarTodasLasMateriasDelNivel = (materiasDelNivel) => {
        const { bolsaRegulares, bolsaAprobadas } = bolsas;

        const idsHabilitadas = materiasDelNivel
            .filter(m => m.validarCorrelativas(bolsaRegulares, bolsaAprobadas))
            .map(m => m.id);

        setSelectedMaterias(prevMaterias => prevMaterias.map(m => {
            if (idsHabilitadas.includes(m.id)) {
                return new Materia({
                    ...m,
                    estado: next(m.estado),
                });
            }
            return m;
        }));
    };
    const verificarDisponibilidadHorarios = async () => {
        if (!puedeCursarIds.length) return [];

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const materiasSinComision = [];

        try {
            const promesas = puedeCursarIds.map(async (materiaId) => {
                try {
                    let comisiones = [];

                    if (USE_MOCKS) {
                        comisiones = comisionesMock.filter(c => c.materiaId === materiaId);
                    } else {
                        const res = await fetch(`${apiUrl}/api/materias/${materiaId}/comisiones`);
                        if (!res.ok) return null;
                        comisiones = await res.json();
                    }

                    const tieneHorarios = comisiones.some(c =>
                        c.periodo === selectedCuatri || c.periodo === 0
                    );

                    if (!tieneHorarios) {
                        const materia = selectedMaterias.find(m => m.id === materiaId);
                        if (materia) {
                            materiasSinComision.push(materia.nombre);
                        }
                    }
                } catch (error) {
                    console.error(`Error verificando materia ${materiaId}`, error);
                }
            });

            await Promise.all(promesas);
        } catch (error) {
            console.error("Error general en validación de horarios", error);
        }

        return materiasSinComision;
    };

    const guardarEstadoCorrelativas = async () => {
        if (!isAuthenticated) {
            setAlertModalMessage("Debes iniciar sesión para guardar tu progreso de correlativas.");
            setShowAlertModal(true);
            return;
        }

        try {
            setGuardandoEstado(true);
            const payload = selectedMaterias.map(m => ({
                materiaId: m.id,
                estado: m.estado ?? 0
            }));
            const resp = await saveEstadoCorrelativas(payload);
            setUltimaActualizacion(resp?.ultimaActualizacion || new Date().toISOString());
            setAlertModalMessage("Tus estados de correlativas se guardaron en el perfil.");
            setShowAlertModal(true);
        } catch (error) {
            const mensaje = handleApiError(error, "No se pudo guardar tu progreso de correlativas");
            setAlertModalMessage(mensaje);
            setShowAlertModal(true);
        } finally {
            setGuardandoEstado(false);
        }
    };

    const confirmarNavegacion = () => {
        const qMat = puedeCursarIds.join(",");
        navigate(`/armar?materiaIds=${qMat}&cuatri=${selectedCuatri}`);
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!selectedCuatri) {
            setAlertModalMessage("Por favor, selecciona un cuatrimestre antes de continuar.");
            setShowAlertModal(true);
            return;
        }

        if (!puedeCursarIds.length) return;

        setValidando(true);
        const sinHorarios = await verificarDisponibilidadHorarios();
        setValidando(false);

        if (sinHorarios.length > 0) {
            const mensaje = (
                <div>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                        Hay materias que no poseen horarios en este cuatrimestre, podés continuar pero no las verás en la planificación.
                    </p>
                    <p style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        Materias afectadas:
                    </p>
                    <ul style={{ 
                        margin: 0, 
                        paddingLeft: '1.5rem',
                        listStyleType: 'disc',
                        lineHeight: '1.8'
                    }}>
                        {sinHorarios.map((materia, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>
                                {materia}
                            </li>
                        ))}
                    </ul>
                </div>
            );
            setWarningModalMessage(mensaje);
            setShowWarningModal(true);
        } else {
            confirmarNavegacion();
        }
    },
        [puedeCursarIds, selectedCuatri, navigate]
    );

    return (
        <div className="app-wrapper" >
            <div className="orbits" aria-hidden="true">
                <div className="orbit o1"></div>
                <div className="orbit o2"></div>
                <div className="orbit o3"></div>
            </div>
            <Container fluid className='main-container' style={{ width: '95vw' }}>
                <Row>

                    <h1 className="text-center mt-5" style={{ color: 'var(--text-primary)' }}>Correlativas CRUMA</h1>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                        <AppButton
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={validando}
                        >
                            {validando ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Verificando...
                                </>
                            ) : (
                                "Confirmar Planificación"
                            )}
                        </AppButton>
                        {isAuthenticated && (
                            <AppButton
                                variant="secondary"
                                size="lg"
                                onClick={guardarEstadoCorrelativas}
                                disabled={guardandoEstado || cargandoPersistencia}
                                style={{ marginLeft: '0.75rem' }}
                            >
                                {guardandoEstado ? "Guardando..." : "Guardar progreso"}
                            </AppButton>
                        )}
                    </div>
                    {isAuthenticated && (
                        <p style={{ textAlign: 'center', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                            {cargandoPersistencia
                                ? "Cargando tu progreso guardado..."
                                : ultimaActualizacion
                                    ? `Última actualización: ${new Date(ultimaActualizacion).toLocaleString('es-AR')}`
                                    : "Aún no guardaste tu progreso de correlativas"}
                        </p>
                    )}

                </Row>


                <div style={{ display: "flex", gap: "0.75rem", margin: "1rem", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Selecciona el cuatrimestre</p>
                    {[1, 2].map(n => (
                        <AppButton
                            key={n}
                            onClick={() => setSelectedCuatri(n)}
                            variant={selectedCuatri === n ? "primary" : "default"}
                            style={{
                                width: "2.5rem",
                                minWidth: "2.5rem"
                            }}
                        >
                            {n}
                        </AppButton>
                    ))}
                </div>

                <div className="levels-container">
                    {nivelesVisibles.map(([nivel, mats]) => (
                        <Columna
                            key={nivel}
                            nivel={nivel}
                            materias={mats}
                            onMateriaClick={handleMateriaClick}
                            onActualizarNivel={actualizarTodasLasMateriasDelNivel}
                            bolsas={bolsas}
                            isElectivas={nivel === "Electivas"}
                        />
                    ))}
                </div>
                <footer>
                    <p>© 2025 CRUMA - Sistema de Gestión de Horarios Universitarios</p>
                </footer>
            </Container>

            <AppModal
                show={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title="Información"
                message={alertModalMessage}
                cancelText=""
                confirmText="Aceptar"
                onConfirm={() => setShowAlertModal(false)}
                isWarning={false}
            />

            <AppModal
                show={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                title="Materias sin horarios"
                message={warningModalMessage}
                cancelText="Cancelar"
                confirmText="Continuar"
                onConfirm={() => {
                    setShowWarningModal(false);
                    confirmarNavegacion();
                }}
                isWarning={true}
            />
        </div>
    );
};