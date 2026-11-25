"use strict";

const Ruta = require('../models/Ruta');
const AppError = require('../utils/appError');

function populateRuta(query) {
  return query
    .populate('centro', 'nombre ubicacion estado')
    .populate('repartidor', 'nombre telefono estado')
    .populate('vehiculo', 'placa tipo marca modelo estado')
    .populate({
      path: 'paradas.entrega',
      select: 'destinatario categoria direccionDestino destino estado',
    });
}

class RutaService {
  async getAll(filters = {}) {
    return populateRuta(Ruta.find(filters).sort({ createdAt: -1 }));
  }

  async getGeoJson(filters = {}) {
    return Ruta.find(filters)
      .select('nombre centro repartidor vehiculo paradas geometria estado');
  }

  async getById(id) {
    const ruta = await populateRuta(Ruta.findById(id));
    if (!ruta) {
      throw new AppError(404, 'Ruta no encontrada.');
    }
    return ruta;
  }

  async create(data) {
    return Ruta.create(data);
  }

  async patch(id, data) {
    const updatedData = await Ruta.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Ruta no encontrada.');
    }
    return this.getById(updatedData.id);
  }

  async delete(id) {
    const deletedItem = await Ruta.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Ruta no encontrada.');
    }
    return deletedItem;
  }
}

module.exports = RutaService;
