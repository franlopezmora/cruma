import { api } from "./axios"

export function fetchMaterias(){
    return api.get('/materias')
    .then(res => res.data)
}


