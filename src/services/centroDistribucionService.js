"use strict";

const AppError = require('../utils/appError');
const CentroDistribucion = require('../models/CentroDistribucion');

class CentroDistribucionService {
    async getAll(filters = {}) {
        const data = await CentroDistribucion.find(filters).sort({ nombre: 1 });
        return data;
    }

    async getGeoJson(filters = {}) {
        const data = await CentroDistribucion.find(filters)
            .select('nombre gerente ubicacion coberturaKm estado');
        return data;
    }

    async getById(id) {
        const data = await CentroDistribucion.findById(id);
        if (!data) {
            throw new AppError(404, 'Centro de distribución no encontrado.');
        }
        return data;
    }

    async create(data) {
        return CentroDistribucion.create(data);
    }

    async patch(id, data) {
        const updatedData = await CentroDistribucion.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!updatedData) {
            throw new AppError(404, 'Centro de distribución no encontrado.');
        }
        return updatedData;
    }

    async delete(id) {
        const deletedItem = await CentroDistribucion.findByIdAndDelete(id);
        if (!deletedItem) {
            throw new AppError(404, 'Centro de distribución no encontrado.');
        }
        return deletedItem;
    }
}

module.exports = CentroDistribucionService;
