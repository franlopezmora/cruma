
export const next = (estado) => {
    switch (estado) {
        case 0:
            return 1
        case 1:
            return 2
        case 2:
            return 3
        case 3:
            return 1
        default:
            return 1
    }
}

export class Materia {
    constructor(materia) {
        this.id = materia.id
        this.nivel = materia.nivel
        this.nombre = materia.nombre
        this.electiva = materia.electiva
        this.necesitaRegularIds = materia.requiereRegularIds || materia.necesitaRegularIds || []
        this.necesitaAprobadaIds = materia.requiereAprobadaIds || materia.necesitaAprobadaIds || []

        this.necesitaRegular = materia.necesitaRegular || []
        this.necesitaAprobada = materia.necesitaAprobada || []
        if (materia.estado !== undefined) {
            this.estado = materia.estado
        } else {
            this.estado = this.nivel == 1 ? 1 : 0
        }
    }
    validarCorrelativas = (bolsaReg, bolsaAprobadas) => {
        const cumpleRegular = this.necesitaRegularIds.length > 0 ? this.necesitaRegularIds.every((necReg) =>
            bolsaReg.includes(necReg) || bolsaAprobadas.includes(necReg)
        ) : true;

        const cumpleAprobadas = this.necesitaAprobadaIds.length > 0 ? this.necesitaAprobadaIds.every((necAprob) =>
            bolsaAprobadas.includes(necAprob)
        ) : true

        return cumpleRegular && cumpleAprobadas
    }
    siguienteEstado = () => {
        this.estado = next(this.estado)
    }

}