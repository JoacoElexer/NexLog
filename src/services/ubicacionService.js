"use strict";

const AppError = require('../utils/appError');
const Ubicacion = require('../models/Ubicacion');
const mongoose = require('mongoose');
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function populateUbicacion(query) {
  return query
    .populate('categoria', 'nombre descripcion')
    .populate('zona', 'nombre estado');
}

class UbicacionService {
  async getAll(filters = {}) {
    // Build query with safe, case‑insensitive partial matching for "nombre"
    const query = {};
    if (filters.nombre) {
      const escaped = escapeRegex(filters.nombre);
      query.nombre = { $regex: escaped, $options: 'i' };
    }
    // Exact ObjectId match for categoria (if provided)
    if (filters.categoria) {
      if (!mongoose.isObjectIdOrHexString(filters.categoria)) {
        throw new AppError(400, 'categoria debe ser un ObjectId válido.');
      }
      query.categoria = filters.categoria;
    }
    // Exact ObjectId match for zona – also apply geoWithin filter using zona polygon
    if (filters.zona) {
      if (!mongoose.isObjectIdOrHexString(filters.zona)) {
        throw new AppError(400, 'zona debe ser un ObjectId válido.');
      }
      // Resolve zona polygon and add $geoWithin condition
      return ZonaReparto.findById(filters.zona)
        .then(zona => {
          if (!zona) {
            throw new AppError(404, 'Zona no encontrada.');
          }
          query.ubicacion = { $geoWithin: { $geometry: zona.geometria } };
          return populateUbicacion(Ubicacion.find(query).sort({ createdAt: -1 }));
        });
    }
    // No zona filter – regular find
    return populateUbicacion(Ubicacion.find(query).sort({ createdAt: -1 }));
  }

  async getGeoJson(filters = {}) {
    const docs = await this.getAll(filters);
    const features = docs.map(doc => ({
      type: 'Feature',
      geometry: doc.ubicacion,
      properties: {
        id: doc._id,
        nombre: doc.nombre,
        descripcion: doc.descripcion,
        categoria: doc.categoria ? doc.categoria.nombre : null,
        zona: doc.zona ? doc.zona.toString() : null,
      },
    }));
    return { type: 'FeatureCollection', features };
  }

  async getById(id) {
    const doc = await Ubicacion.findById(id).populate('categoria', 'nombre');
    if (!doc) {
      throw new AppError(404, 'Ubicación no encontrada.');
    }
    return doc;
  }

  async create(data) {
    return Ubicacion.create(data);
  }

  async patch(id, data) {
    const updated = await Ubicacion.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) {
      throw new AppError(404, 'Ubicación no encontrada.');
    }
    return updated;
  }

  async delete(id) {
    const removed = await Ubicacion.findByIdAndDelete(id);
    if (!removed) {
      throw new AppError(404, 'Ubicación no encontrada.');
    }
    return removed;
  }
}

module.exports = UbicacionService;
