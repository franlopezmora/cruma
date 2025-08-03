// src/mocks/comisionesMock.js

export const comisionesMock = [
  // Análisis Matemático I (nivel 1, anual)
  {
    comisionId: 101,
    materiaId: 1,
    seccion: "1",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "lunes",    horaEntrada: "08:00", horaSalida: "10:00" },
      { dia: "miércoles",horaEntrada: "08:00", horaSalida: "10:00" },
    ]
  },
  {
    comisionId: 102,
    materiaId: 1,
    seccion: "2",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "martes",   horaEntrada: "10:00", horaSalida: "12:00" },
      { dia: "viernes",  horaEntrada: "10:00", horaSalida: "12:00" },
    ]
  },

  // Álgebra I (nivel 1, anual)
  {
    comisionId: 201,
    materiaId: 2,
    seccion: "A",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "lunes",    horaEntrada: "10:30", horaSalida: "12:30" },
      { dia: "miércoles",horaEntrada: "10:30", horaSalida: "12:30" },
    ]
  },
  {
    comisionId: 202,
    materiaId: 2,
    seccion: "B",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "martes",   horaEntrada: "08:00", horaSalida: "10:00" },
      { dia: "jueves",   horaEntrada: "08:00", horaSalida: "10:00" },
    ]
  },

  // Física I (nivel 1, anual)
  {
    comisionId: 301,
    materiaId: 3,
    seccion: "1",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "martes",   horaEntrada: "14:00", horaSalida: "16:00" },
      { dia: "viernes",  horaEntrada: "14:00", horaSalida: "16:00" },
    ]
  },
  {
    comisionId: 302,
    materiaId: 3,
    seccion: "2",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "miércoles",horaEntrada: "08:00", horaSalida: "10:00" },
      { dia: "jueves",   horaEntrada: "12:00", horaSalida: "14:00" },
    ]
  },

  // Programación I (nivel 1, anual)
  {
    comisionId: 401,
    materiaId: 4,
    seccion: "2",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "lunes",    horaEntrada: "14:00", horaSalida: "16:00" },
      { dia: "miércoles",horaEntrada: "14:00", horaSalida: "16:00" },
    ]
  },
  {
    comisionId: 402,
    materiaId: 4,
    seccion: "2",
    carrera: "K",
    periodo: 0,
    horarios: [
      { dia: "martes",   horaEntrada: "16:00", horaSalida: "18:00" },
      { dia: "jueves",   horaEntrada: "16:00", horaSalida: "18:00" },
    ]
  },

  // Análisis de Sistemas de Información (nivel 2, 1er cuatri)
  {
    comisionId: 501,
    materiaId: 5,
    seccion: "1",
    carrera: "K",
    periodo: 1,
    horarios: [
      { dia: "lunes",    horaEntrada: "08:00", horaSalida: "10:00" },
      { dia: "miércoles",horaEntrada: "10:00", horaSalida: "23:05" },
    ]
  },
  {
    comisionId: 502,
    materiaId: 5,
    seccion: "2",
    carrera: "K",
    periodo: 1,
    horarios: [
      { dia: "martes",   horaEntrada: "12:00", horaSalida: "14:00" },
      { dia: "jueves",   horaEntrada: "08:00", horaSalida: "10:00" },
    ]
  },

  // Sistemas Operativos (nivel 2, 1er cuatri)
  {
    comisionId: 601,
    materiaId: 6,
    seccion: "A",
    carrera: "K",
    periodo: 1,
    horarios: [
      { dia: "martes",   horaEntrada: "08:00", horaSalida: "10:00" },
      { dia: "viernes",  horaEntrada: "08:00", horaSalida: "10:00" },
    ]
  },
  {
    comisionId: 602,
    materiaId: 6,
    seccion: "B",
    carrera: "K",
    periodo: 1,
    horarios: [
      { dia: "miércoles",horaEntrada: "12:00", horaSalida: "14:00" },
      { dia: "jueves",   horaEntrada: "14:00", horaSalida: "16:00" },
    ]
  },

  // Redes de Datos (nivel 3, 2do cuatri)
  {
    comisionId: 701,
    materiaId: 7,
    seccion: "1",
    carrera: "K",
    periodo: 2,
    horarios: [
      { dia: "lunes",    horaEntrada: "10:00", horaSalida: "12:00" },
      { dia: "miércoles",horaEntrada: "14:00", horaSalida: "16:00" },
    ]
  },
  {
    comisionId: 702,
    materiaId: 7,
    seccion: "2",
    carrera: "K",
    periodo: 1,
    horarios: [
      { dia: "martes",   horaEntrada: "16:00", horaSalida: "18:00" },
      { dia: "jueves",   horaEntrada: "12:00", horaSalida: "14:00" },
    ]
  }
];
