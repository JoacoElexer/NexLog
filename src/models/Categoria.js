"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const categoriaSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, unique: true },
    descripcion: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Categoria', categoriaSchema, 'categorias');
