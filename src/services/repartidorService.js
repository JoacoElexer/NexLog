"use strict";

const Repartidor = require('../models/Repartidor');
const AppError = require('../utils/appError');

class RepartidorService {
  async getAll(filters = {}) {
    return Repartidor.find(filters).sort({ nombre: 1 });
  }

  async getById(id) {
    const repartidor = await Repartidor.findById(id);
    if (!repartidor) {
      throw new AppError(404, 'Repartidor no encontrado.');
    }
    return repartidor;
  }

  async create(data) {
    return Repartidor.create(data);
  }

  async patch(id, data) {
    const updatedData = await Repartidor.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Repartidor no encontrado.');
    }
    return updatedData;
  }

  async delete(id) {
    const deletedItem = await Repartidor.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Repartidor no encontrado.');
    }
    return deletedItem;
  }
}

module.exports = RepartidorService;
