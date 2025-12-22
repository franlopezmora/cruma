import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FaCalendarAlt, FaSearch, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import AppButton from "../components/AppButton";
import calendarPreview from "../assets/calendar-preview.svg";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    navigate('/seleccionar-materias');
  };

  const handleCorrelativas = () => {
    navigate('/correlativas');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <>

      <div className="landing-page">
        {/* Background Orbits */}
        <div className="orbits" aria-hidden="true">
          <div className="orbit o1"></div>
          <div className="orbit o2"></div>
          <div className="orbit o3"></div>
        </div>

        <Container className="main-container">
          {/* Header */}
          <header className="hero-header">
            <h1 className="brand">CRUMA</h1>
            <h2 className="subtitle">Sistema inteligente para la gestión de horarios universitarios</h2>
            <p className="lede">Organiza tus materias y crea cronogramas personalizados de manera eficiente.</p>
          </header>

        {/* Link suave hacia la página de login cuando no está autenticado */}
        {!isAuthenticated && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <AppButton
              variant="secondary"
              onClick={goToLogin}
            >
              Iniciar sesión para guardar cronogramas
            </AppButton>
          </div>
        )}

        {/* Calendar Preview */}
        <section className="calendar-wrap" aria-label="Vista previa del calendario">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={calendarPreview} 
              alt="Vista previa del calendario de horarios" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </section>

        {/* CTA */}
        <div className="cta" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <AppButton 
              size="lg" 
              variant="primary"
              onClick={handleGetStarted}
            >
              Comenzar sin guardar
            </AppButton>
            <AppButton 
              size="lg" 
              variant="default"
              onClick={handleCorrelativas}
            >
              Ver Correlativas
            </AppButton>
          </div>
        </div>

        {/* Features */}
        <section className="features" aria-label="Características principales">
          <article className="card">
            <FaCalendarAlt className="icon" size={34} />
            <h3>Cronogramas Inteligentes</h3>
            <p>Crea cronogramas personalizados que se adapten perfectamente a tu horario y preferencias de estudio.</p>
          </article>

          <article className="card">
            <FaSearch className="icon" size={34} />
            <h3>Búsqueda Avanzada</h3>
            <p>Encuentra rápidamente las materias que necesitas con nuestro sistema de búsqueda por código o nombre.</p>
          </article>

          <article className="card">
            <FaGraduationCap className="icon" size={34} />
            <h3>Organización Eficiente</h3>
            <p>Selecciona materias de diferentes años y cuatrimestres para crear tu plan de estudios ideal.</p>
          </article>
        </section>

        {/* Footer */}
       <footer>
          <p>© 2025 CRUMA - Sistema de Gestión de Horarios Universitarios</p>
        </footer>
      </Container>
    </div>
    </>
  );
}