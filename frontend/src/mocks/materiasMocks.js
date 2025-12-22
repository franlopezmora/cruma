import {Materia} from "../utils/auxiliaresCorrelativas"

export const materiasMock = [
  { id: 1,  codigo: "AMI", nombre: "Análisis Matemático I",nivel: 1, requiereRegular: [], requiereAprobadas: [] },
  { id: 2,  codigo: "ALI", nombre: "Álgebra I",nivel: 1, requiereRegular: [], requiereAprobadas: [] },
  { id: 3,  codigo: "FI1", nombre: "Física I", nivel: 1, requiereRegular: [], requiereAprobadas: [] },
  { id: 4,  codigo: "AED", nombre: "Algoritmos y Estructuras de Datos",nivel: 1, requiereRegular: [], requiereAprobadas: [] },
  { id: 5,  codigo: "ASI", nombre: "Análisis de Sistemas de Información", nivel: 2, requiereRegular: [], requiereAprobadas: [] },
  { id: 6,  codigo: "SO",  nombre: "Sistemas Operativos",nivel: 2, requiereRegular: [4], requiereAprobadas: [5] },
  { id: 7,  codigo: "RED", nombre: "Redes de Datos", nivel: 3, requiereRegular: [6,3], requiereAprobadas: [] }
];
export const materiasCorrelativasMock = (materiasMock)=>{
  const materiasCorrelativas = []
  materiasMock.map((materia)=>{
    materiasCorrelativas.push(new Materia(materia))
  })  
  return materiasCorrelativas
}
export const materiasMockCorrelativas = [

  {
    id: 2,
    nivel: 1,
    nombre: "Análisis Matemático I",
    requiereRegular: [],
    requiereAprobadas: []
  },
  {
    id: 5,
    nivel: 1, 
    nombre: "Ingeniería y Sociedad",
    requiereRegular: [],
    requiereAprobadas: []
  },

//2do año

  {
    id: 11,
    nivel: 2,
    nombre: "Análisis Matemático II",
    requiereRegular: [{ id: 2, nombre: "Análisis Matemático I" }, { id: 9, nombre: "Álgebra y Geometría Analítica" }],
    requiereAprobadas: []
  },
  {
    id: 15,
    nivel: 2,
    nombre: "Física II",
    requiereRegular: [{ id: 2, nombre: "Análisis Matemático I" }, { id: 4, nombre: "Física I" }],
    requiereAprobadas: []
  },

// 3er AÑo

  {
    id: 17,
    nivel: 3,
    nombre: "Diseño de Sistemas de Información (Int)",
    requiereRegular: [{ id: 16, nombre: "Paradigmas de Programación" }, { id: 14, nombre: "Análisis de Sistemas de Información (Int)" }],
    requiereAprobadas: [{ id: 6, nombre: "Inglés I" }, { id: 1, nombre: "Algoritmo y Estructura de Datos" }, { id: 8, nombre: "Sistemas y Proceso de Negocios" }]
  },
  {
    id: 22,
    nivel: 3, 
    nombre: "Análisis Numérico",
    requiereRegular: [{ id: 11, nombre: "Análisis Matemático II" }],
    requiereAprobadas: [{ id: 2, nombre: "Análisis Matemático I" }, { id: 9, nombre: "Álgebra y Geometría Analítica" }]
  },

// 4to año

  {
    id: 36,
    nivel: 4,
    nombre: "Legislación",
    requiereRegular: [{ id: 5, nombre: "Ingeniería y Sociedad" }],
    requiereAprobadas: []
  },
  {
    id: 27,
    nivel: 4,
    nombre: "Redes de Datos",
    requiereRegular: [{ id: 13, nombre: "Sistemas Operativos" }, { id: 18, nombre: "Comunicación de Datos" }],
    requiereAprobadas: []
  },
//5to año

  {
    id: 39,
    nivel: 5,
    nombre: "Inteligencia Artificial",
    requiereRegular: [{ id: 32, nombre: "Simulación" }],
    requiereAprobadas: [{ id: 12, nombre: "Probabilidad y Estadística" }, { id: 22, nombre: "Análisis Numérico" }]
  },
  {
    id: 51,
    nivel: 5,
    nombre: "Ciencia de Datos",
    requiereRegular: [{ id: 32, nombre: "Simulación" }],
    requiereAprobadas: [{ id: 12, nombre: "Probabilidad y Estadística" }, { id: 19, nombre: "Base de Datos" }]
  }
];

// Formato normalizado que imita la respuesta del backend
export const materiasMockApi = materiasMock.map((m) => ({
  id: m.id,
  codigo: m.codigo,
  nombre: m.nombre,
  anioCarrera: m.nivel,
  electiva: false,
  requiereRegularIds: m.requiereRegular || [],
  requiereAprobadaIds: m.requiereAprobadas || []
}));

// Correlativas en el formato usado por el servicio de correlativas
export const correlativasMockApi = materiasMock.map((m) => ({
  materiaId: m.id,
  requiereRegularIds: m.requiereRegular || [],
  requiereAprobadaIds: m.requiereAprobadas || []
}));