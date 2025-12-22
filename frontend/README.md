# Frontend (React + Vite)

## Modo demo (sin backend)

- Por defecto se usan mocks locales y no se llama a la API.
- Bandera: `VITE_USE_MOCKS` (se lee en `src/utils/env.js`):
  - `true` o sin definir → usa datos mock (materias, correlativas, comisiones y auth demo).
  - `false` → usa backend real (requiere `VITE_API_URL` si no sirve en `/api`).

### Correr en modo demo
```bash
cd frontend
npm install
npm run dev
# abre http://localhost:3000
```

### Cambiar a backend real
```bash
# macOS/Linux
export VITE_USE_MOCKS=false
export VITE_API_URL=http://localhost:8080/api   # opcional si no usas proxy

# Windows (cmd)
set VITE_USE_MOCKS=false
set VITE_API_URL=http://localhost:8080/api

npm run dev
```

## Scripts útiles
- `npm run dev` – desarrollo con HMR.
- `npm run build` – build de producción.
- `npm run preview` – sirve el build localmente.
