# Cruma — Código Fuente

> **ATENCIÓN**  
> Este repositorio está sujeto a un EULA de **Todos los derechos reservados**.  
> No es software libre y requiere autorización expresa para cualquier despliegue.

Este repositorio contiene **solo** el código fuente de la aplicación Cruma, dividido en dos carpetas principales:

- **backend/**: Servicio Spring Boot  
- **frontend/**: Aplicación React  

_Ninguna configuración de despliegue, Dockerfiles ni variables de entorno están incluidas._

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

1. Entra en la carpeta del backend:  
   ```bash
   cd backend
   ```
2. Compila y ejecuta:  
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

1. Entra en la carpeta del frontend:  
   ```bash
   cd frontend
   ```
2. Instala dependencias y levanta el servidor de desarrollo:  
   ```bash
   npm install
   npm start
   ```
3. Tu navegador abrirá `http://localhost:3000`.

---

## Contribuir

1. Haz un **fork** de este repositorio.  
2. Crea una rama para tu feature o corrección:  
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```
3. Realiza tus cambios, haz commits claros y súbelos:  
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```
4. Abre un **Pull Request** para revisión.

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
