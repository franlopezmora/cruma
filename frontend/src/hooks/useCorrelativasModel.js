import { useQuery } from "@tanstack/react-query";
import { fetchMaterias } from "../api/materias";
import { fetchCorrelativas } from "../api/correlativas";
import { buildCorrelativasModel } from "../services/correlativasServices";
export function useCorrelativasModel() {
  return useQuery({
    queryKey: ["correlativasModel"],
    queryFn: async () => {
      console.log("Estamosdentro del async () de queryfn")
      const materias = await fetchMaterias();
      console.log("Materias obtenidas: ",materias);
      const correlativas = await fetchCorrelativas();
      console.log("Correlativas obtenidas: ",correlativas); 
      return buildCorrelativasModel(materias, correlativas);
    },
    staleTime: 5 * 60 * 1000,
  });
}
