import { Materia } from "../utils/auxiliaresCorrelativas";

export function buildCorrelativasModel(materias, correlativas) {
    const materiaById = new Map(materias.map(m => [m.id, m]));

    const correlativasByMateriaId = new Map(
        (correlativas ?? []).map(c => [
            c.materiaId,
            {
                requiereRegularIds: c.requiereRegularIds ?? [],
                requiereAprobadaIds: c.requiereAprobadaIds ?? [],
            }
        ])
    );

    const materiasInstanciadas = materias.map(m => {
        const c = correlativasByMateriaId.get(m.id) ?? { requiereRegularIds: [], requiereAprobadaIds: [] };

        const mapToObj = (ids) => (ids ?? []).map(id => {
            const mat = materiaById.get(id);
            return { id, nombre: mat ? mat.nombre : '?' };
        });

        return new Materia({
            id: m.id,
            nombre: m.nombre,
            nivel: m.anioCarrera,
            codigo: m.codigo,
            electiva: m.electiva,
            requiereRegularIds: c.requiereRegularIds,
            requiereAprobadaIds: c.requiereAprobadaIds,
            necesitaRegular: mapToObj(c.requiereRegularIds),
            necesitaAprobada: mapToObj(c.requiereAprobadaIds),
        });
    });

    return { materiasInstanciadas, materiaById, correlativasByMateriaId };
}
