import { Container } from "react-bootstrap";
import { FaGoogle, FaGithub, FaUserCheck } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import AppButton from "../components/AppButton";
import { USE_MOCKS } from "../utils/env";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleLoginGoogle = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const handleLoginGithub = () => {
    window.location.href = "/oauth2/authorization/github";
  };

  const handleLoginDemo = () => {
    loginDemo?.();
    navigate("/");
  };

  return (
    <div className="landing-page">
      {/* Background Orbits (reutilizamos el estilo visual de la home) */}
      <div className="orbits" aria-hidden="true">
        <div className="orbit o1"></div>
        <div className="orbit o2"></div>
        <div className="orbit o3"></div>
      </div>

      <Container className="main-container" style={{ zIndex: 1 }}>
        <header className="hero-header" style={{ marginBottom: "1.5rem" }}>
          <h1 className="brand">CRUMA</h1>
          <h2 className="subtitle">Iniciar sesión</h2>
          <p className="lede">
            Usá tu cuenta de Google o GitHub para guardar y sincronizar tus
            cronogramas.
          </p>
        </header>

        <section
          aria-label="Inicio de sesión"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "420px",
              width: "100%",
              padding: "2.25rem 2rem",
              borderRadius: "12px",
              background: "var(--bg-secondary)",
              boxShadow: "0 4px 12px var(--shadow)",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                margin: "0 auto 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <svg 
                width="30" 
                height="30" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <path 
                  d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
              }}
            >
              {isAuthenticated ? "Ya estás conectado" : "Logueate para empezar"}
            </h2>
            {!isAuthenticated && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.5rem",
                  lineHeight: "1.5",
                }}
              >
                Elegí tu proveedor favorito. Nunca almacenamos tu contraseña;
                solo usamos OAuth seguro de Google y GitHub.
              </p>
            )}

            {!isAuthenticated && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {!USE_MOCKS && (
                  <>
                    <AppButton
                      onClick={handleLoginGoogle}
                      variant="primary"
                      style={{ width: "100%" }}
                    >
                      <FaGoogle size={16} />
                      <span>Continuar con Google</span>
                    </AppButton>

                    <AppButton
                      onClick={handleLoginGithub}
                      variant="default"
                      style={{ width: "100%" }}
                    >
                      <FaGithub size={16} />
                      <span>Continuar con GitHub</span>
                    </AppButton>
                  </>
                )}

                {USE_MOCKS && (
                  <AppButton
                    onClick={handleLoginDemo}
                    variant="primary"
                    style={{ width: "100%" }}
                  >
                    <FaUserCheck size={16} />
                    <span>Entrar en modo demo</span>
                  </AppButton>
                )}
              </div>
            )}
          </div>
        </section>
      </Container>
    </div>
  );
}




