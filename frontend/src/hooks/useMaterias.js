import {useQuery} from '@tanstack/react-query'
import { fetchMaterias } from '../api/materias'
import { materiasMockApi } from '../mocks/materiasMocks'
import { USE_MOCKS } from '../utils/env'

export function useMaterias(){
    if (USE_MOCKS) {
        // Devolvemos forma similar a useQuery para minimizar cambios
        return { data: materiasMockApi, isLoading: false, isError: false }
    }
    return useQuery({
        queryKey: ['materias'],
        queryFn: fetchMaterias
    })
}