"use strict";

const ZonaReparto = require('../models/ZonaReparto');
const AppError = require('../utils/appError');

function populateZonaReparto(query) {
  return query.populate('centro', 'nombre ubicacion estado coberturaKm');
}

class ZonaRepartoService {
  async getAll(filters = {}) {
    return populateZonaReparto(ZonaReparto.find(filters).sort({ createdAt: -1 }));
  }

  async getGeoJson(filters = {}) {
    return ZonaReparto.find(filters)
      .select('nombre descripcion centro geometria estado');
  }

  async getById(id) {
    const zona = await populateZonaReparto(ZonaReparto.findById(id));
    if (!zona) {
      throw new AppError(404, 'Zona de reparto no encontrada.');
    }
    return zona;
  }

  async create(data) {
    return ZonaReparto.create(data);
  }

  async patch(id, data) {
    const updatedData = await ZonaReparto.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Zona de reparto no encontrada.');
    }
    return this.getById(updatedData.id);
  }

  async delete(id) {
    const deletedItem = await ZonaReparto.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Zona de reparto no encontrada.');
    }
    return deletedItem;
  }
}

module.exports = ZonaRepartoService;
