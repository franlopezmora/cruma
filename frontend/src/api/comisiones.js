import { api } from "./axios";
import { USE_MOCKS } from "../utils/env";
import { comisionesMock } from "../mocks/comisionesMock";

export function fetchComisionesBatch(materiaIds){
    if (USE_MOCKS) {
        const ids = new Set(materiaIds);
        return Promise.resolve(comisionesMock.filter(c => ids.has(c.materiaId)));
    }
    return api.get('/comisiones', {params: materiaIds.join(',')})
    .then ( res => res.data)
    
}