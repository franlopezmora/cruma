import { api } from "./axios"
import { USE_MOCKS } from "../utils/env"
import { materiasMockApi } from "../mocks/materiasMocks"

export function fetchMaterias(){
    if (USE_MOCKS) {
        return Promise.resolve(materiasMockApi)
    }
    return api.get('/materias')
    .then(res => res.data)
}
