
"use strict";

const Categoria = require('../models/Categoria');

const CATEGORIAS_DATA = [
    {
        nombre: 'Comercial',
        descripcion: 'Establecimientos y comercios.',
    },
    {
        nombre: 'Servicios',
        descripcion: 'Lugares que ofrecen servicios.',
    },
    {
        nombre: 'Residencial',
        descripcion: 'Puntos de referencia residenciales.',
    },
    {
        nombre: 'Industrial',
        descripcion: 'Instalaciones y zonas industriales.',
    },
    {
        nombre: 'Institucional',
        descripcion: 'Escuelas, hospitales y oficinas públicas.',
    },
];

async function seedCategorias() {
    const nombres = CATEGORIAS_DATA.map((item) => item.nombre);

    const existingDocs = await Categoria.find({
        nombre: { $in: nombres },
    });

    const existingByName = new Map(
        existingDocs.map((doc) => [doc.nombre, doc])
    );

    const missing = CATEGORIAS_DATA.filter(
        (item) => !existingByName.has(item.nombre)
    );

    if (missing.length > 0) {
        const inserted = await Categoria.insertMany(missing);
        inserted.forEach((doc) => existingByName.set(doc.nombre, doc));
    }

    return {
        total: existingByName.size,
        created: missing.length,
        docs: CATEGORIAS_DATA.map(
            (item) => existingByName.get(item.nombre)
        ),
    };
}

module.exports = { CATEGORIAS_DATA, seedCategorias };
