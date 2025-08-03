import {useQuery} from '@tanstack/react-query'
import { fetchMaterias } from '../api/materias'
import { materiasMock } from '../mocks/materiasMocks'

export function useMaterias(){
    return materiasMock;
}

//export function useMaterias(){
   // return useQuery({
   //     queryKey: ['materias'],
  //      queryFn: fetchMaterias
  //  })
//}