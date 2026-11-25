"use strict";

const Entrega = require('../models/Entrega');
const AppError = require('../utils/appError');

function populateEntrega(query) {
  return query
    .populate('centro', 'nombre ubicacion estado')
    .populate('zona', 'nombre geometria estado')
    .populate('ruta', 'nombre estado');
}

class EntregaService {
  async getAll(filters = {}) {
    return populateEntrega(Entrega.find(filters).sort({ createdAt: -1 }));
  }

  async getGeoJson(filters = {}) {
    return Entrega.find(filters)
      .select('destinatario categoria direccionDestino destino estado centro zona ruta');
  }

  async getById(id) {
    const entrega = await populateEntrega(Entrega.findById(id));
    if (!entrega) {
      throw new AppError(404, 'Entrega no encontrada.');
    }
    return entrega;
  }

  async create(data) {
    return Entrega.create(data);
  }

  async patch(id, data) {
    const updatedData = await Entrega.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Entrega no encontrada.');
    }
    return this.getById(updatedData.id);
  }

  async delete(id) {
    const deletedItem = await Entrega.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Entrega no encontrada.');
    }
    return deletedItem;
  }
}

module.exports = EntregaService;
