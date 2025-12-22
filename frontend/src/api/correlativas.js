import { api } from "./axios";
import { USE_MOCKS } from "../utils/env";
import { correlativasMockApi } from "../mocks/materiasMocks";

export function fetchCorrelativas() {
  if (USE_MOCKS) {
    return Promise.resolve(correlativasMockApi);
  }
  return api.get("/correlativas")
    .then(res => res.data);
}

export function fetchEstadoCorrelativas() {
  if (USE_MOCKS) {
    return Promise.resolve({ estados: [], ultimaActualizacion: null });
  }
  return api.get("/correlativas/estado")
    .then(res => res.data);
}

export function saveEstadoCorrelativas(estados) {
  if (USE_MOCKS) {
    return Promise.resolve({ ultimaActualizacion: new Date().toISOString(), estados });
  }
  return api.put("/correlativas/estado", estados ?? [])
    .then(res => res.data);
}