import { api } from "./axios";

export function fetchCorrelativas() {
  return api.get("/correlativas")
    .then(res => res.data);
}

export function fetchEstadoCorrelativas() {
  return api.get("/correlativas/estado")
    .then(res => res.data);
}

export function saveEstadoCorrelativas(estados) {
  return api.put("/correlativas/estado", estados ?? [])
    .then(res => res.data);
}