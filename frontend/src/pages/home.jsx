import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaCalendarAlt, FaSearch, FaGraduationCap } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/seleccionar-materias');
  };

  return (
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

        {/* Calendar Preview */}
        <section className="calendar-wrap" aria-label="Vista previa del calendario">
          <div className="calendar">
            <div className="calendar-head">
              <div className="rings">
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
              </div>
            </div>
            <div className="calendar-body">
              <div className="cell">
                <span className="pill alg">AGA</span>
              </div>
              <div className="cell">
                <span className="pill ami">AMI</span>
              </div>
              <div className="cell">
                <span className="pill isw">ISW</span>
              </div>
              <div className="cell"></div>

              <div className="cell">
                <span className="pill fi2">FI2</span>
              </div>
              <div className="cell">
                <span className="pill sof">DDS</span>
              </div>
              <div className="cell">
                <span className="pill dsi">DSI</span>
              </div>
              <div className="cell"></div>

              <div className="cell"></div>
              <div className="cell"></div>
              <div className="cell"></div>
              <div className="cell"></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta">
          <Button 
            size="lg" 
            variant="primary" 
            onClick={handleGetStarted}
            className="btn"
          >
            Comenzar
          </Button>
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
  );
}