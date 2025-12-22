# Cruma — Código Fuente

> **ATENCIÓN**  
> Este repositorio está sujeto a un EULA de **Todos los derechos reservados**.  
> No es software libre y requiere autorización expresa para cualquier despliegue.

Este repositorio contiene **solo** el código fuente de la aplicación Cruma, dividido en dos carpetas principales:

- **backend/**: Servicio Spring Boot  
- **frontend/**: Aplicación React  

_Ninguna configuración de despliegue, Dockerfiles ni variables de entorno están incluidas._

---

## Demo en vivo

Podés probar la aplicación en producción en:

**http://traffic-bones.gl.at.ply.gg:53379/**

---

## Estructura del proyecto

```
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/cruma/…
│       └── main/resources/…
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── App.jsx
│       └── index.jsx
├── .gitignore
├── LICENSE
└── README.md
```

---

## Requisitos Previos

- **Java 17+** y **Maven** (o usar `./mvnw`).  
- **Node.js 16+** y **npm** (o Yarn).  
- IDEs como IntelliJ IDEA, VSCode, etc.

---

## Cómo compilar y ejecutar

### Backend (Spring Boot)

1. Entrá en la carpeta del backend:  
   ```bash
   cd backend
   ```
2. Compilá y ejecutá:  
   ```bash
   mvn clean package
   java -jar target/cruma-0.0.1-SNAPSHOT.jar
   ```
   O, usando el wrapper:  
   ```bash
   ./mvnw spring-boot:run
   ```
3. La API escuchará en `http://localhost:8080`.

### Frontend (React)

1. Entrá en la carpeta del frontend:  
   ```bash
   cd frontend
   ```
2. Instalá dependencias y levantá el servidor de desarrollo:  
   ```bash
   npm install
   npm start
   ```
3. Tu navegador abrirá `http://localhost:3000`.

---

### Frontend en modo demo (sin backend)

- Por defecto, el frontend está configurado para usar **mocks locales** y no llamar a la API.  
- La bandera `VITE_USE_MOCKS` se lee en `frontend/src/utils/env.js`:
  - Sin definirla (valor por defecto) o en `true` ⇒ usa datos mock (materias, correlativas, comisiones y auth demo).
  - En `false` ⇒ usa el backend real.
- Para ejecutar en modo demo basta con:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  y navegar a `http://localhost:3000`.
- Para apuntar a un backend, definir en tu entorno:
  ```bash
  set VITE_USE_MOCKS=false          # Windows (cmd)
  export VITE_USE_MOCKS=false       # macOS/Linux
  ```
  y opcionalmente `VITE_API_URL` con la URL de tu API.

---

## Contribuir

1. Hacé un **fork** de este repositorio.  
2. Creá una rama para tu feature o corrección:  
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```
3. Realizá tus cambios, hacé commits claros y subílos:  
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
4. Abrí un **Pull Request** para revisión.

---

## Plantillas automáticas

- **CODEOWNERS** (`.github/CODEOWNERS`):  
  ```text
  /backend/  @franlopezmora
  /frontend/ @nicogaray1608
  ```
- **ISSUE_TEMPLATE** (`.github/ISSUE_TEMPLATE.md`):  
  Captura bugs con pasos para reproducir y entorno.  
- **PULL_REQUEST_TEMPLATE** (`.github/PULL_REQUEST_TEMPLATE.md`):  
  Incluye descripción, checklist de tests y revisión de Code Owners.

---

## Licencia

© 2025 Francisco López Mora & Nicolás Garay. Todos los derechos reservados.

Nadie podrá usar, copiar, modificar, distribuir, desplegar o ejecutar
este software en producción sin el **permiso por escrito** de los autores.

Para más detalles, consulta el archivo [`LICENSE`](./LICENSE).

---

### Créditos

Realizado por **Francisco López Mora** y **Nicolás Garay**  
UTN FRC — Agosto 2025
