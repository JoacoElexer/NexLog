"use strict";

const Vehiculo = require('../models/Vehiculo');
const AppError = require('../utils/appError');

class VehiculoService {
  async getAll(filters = {}) {
    return Vehiculo.find(filters).sort({ placa: 1 });
  }

  async getById(id) {
    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) {
      throw new AppError(404, 'Vehículo no encontrado.');
    }
    return vehiculo;
  }

  async create(data) {
    return Vehiculo.create(data);
  }

  async patch(id, data) {
    const updatedData = await Vehiculo.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Vehículo no encontrado.');
    }
    return updatedData;
  }

  async delete(id) {
    const deletedItem = await Vehiculo.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Vehículo no encontrado.');
    }
    return deletedItem;
  }
}

module.exports = VehiculoService;
