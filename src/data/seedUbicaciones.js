
"use strict";

const Ubicacion = require('../models/Ubicacion');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');

function buildUbicacionesData(categoriasDocs, zonasDocs) {
    const ubicaciones = [];

    CENTROS_DISTRIBUCION_DATA.forEach((centro, index) => {
        const [lon, lat] = centro.ubicacion.coordinates;
        const categoria = categoriasDocs[index % categoriasDocs.length];
        const zona = zonasDocs[index];

        if (!categoria || !zona) {
            throw new Error(
                `No se pudo asignar categoría o zona a la ubicación ${index + 1}.`
            );
        }

        ubicaciones.push({
            nombre: `Punto de referencia ${String(index + 1).padStart(2, '0')}`,
            descripcion: `Ubicación de demostración cercana a ${centro.nombre}.`,
            categoria: categoria._id,
            zona: zona._id,
            ubicacion: {
                type: 'Point',
                coordinates: [
                    Number((lon + 0.01).toFixed(6)),
                    Number((lat + 0.01).toFixed(6)),
                ],
            },
        });
    });

    return ubicaciones;
}

async function seedUbicaciones(categoriasDocs, zonasDocs) {
    const payload = buildUbicacionesData(categoriasDocs, zonasDocs);
    const nombres = payload.map((item) => item.nombre);

    const existingDocs = await Ubicacion.find({
        nombre: { $in: nombres },
    });

    const existingByName = new Map(
        existingDocs.map((doc) => [doc.nombre, doc])
    );

    const missing = payload.filter(
        (item) => !existingByName.has(item.nombre)
    );

    if (missing.length > 0) {
        const inserted = await Ubicacion.insertMany(missing);

        inserted.forEach((doc) => {
            existingByName.set(doc.nombre, doc);
        });
    }

    return {
        total: existingByName.size,
        created: missing.length,
        docs: payload.map(
            (item) => existingByName.get(item.nombre)
        ),
    };
}

module.exports = { buildUbicacionesData, seedUbicaciones };
