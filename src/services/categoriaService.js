"use strict";

const AppError = require('../utils/appError');
const Categoria = require('../models/Categoria');

class CategoriaService {
  async getAll() {
    return Categoria.find().sort({ nombre: 1 });
  }

  async getById(id) {
    const cat = await Categoria.findById(id);
    if (!cat) {
      throw new AppError(404, 'Categoría no encontrada.');
    }
    return cat;
  }

  async create(data) {
    try {
      return await Categoria.create(data);
    } catch (err) {
      // Handle duplicate key error for unique nombre
      if (err.code === 11000) {
        throw new AppError(400, 'El nombre de la categoría ya existe.');
      }
      throw err;
    }
  }

  async patch(id, data) {
    const updated = await Categoria.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      throw new AppError(404, 'Categoría no encontrada.');
    }
    return updated;
  }

  async delete(id) {
    const removed = await Categoria.findByIdAndDelete(id);
    if (!removed) {
      throw new AppError(404, 'Categoría no encontrada.');
    }
    return removed;
  }
}

module.exports = CategoriaService;
