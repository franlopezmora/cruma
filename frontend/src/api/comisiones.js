import { api } from "./axios";

export function fetchComisionesBatch(materiaIds){
    return api.get('/comisiones', {params: materiaIds.join(',')})
    .then ( res => res.data)
    
}