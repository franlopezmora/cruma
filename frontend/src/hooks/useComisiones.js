import { useQuery } from "@tanstack/react-query";
import { fetchComisionesBatch } from "../api/comisiones";

export function useComisiones(materiaIds=[]){
    return useQuery({
        queryKey: ['comisiones', materiaIds],
        queryFn: () => fetchComisionesBatch(materiaIds),
        enabled: materiaIds.length > 0,
        staleTime: 1000 * 60 * 5,
    })
}
