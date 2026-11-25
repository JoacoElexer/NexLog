"use strict";

const Ubicacion = require('../models/Ubicacion');
const Categoria = require('../models/Categoria');
const ZonaReparto = require('../models/ZonaReparto');
const { CATEGORIAS_DATA } = require('./seedCategorias');
const { insertarFaltantes, buscarRequeridos, ejecutarSeed } = require('./seedUtils');

// [nombre, descripción, categoría, zona, latitud, longitud]. Todas dentro de León
// y dentro del polígono de su zona, para que el filtro por zona tenga sentido.
const UBICACIONES_BASE = [
  ['Papelería La Estrella', 'Cliente frecuente; recibe pedidos de lunes a sábado de 9:00 a 19:00 h.', 'Punto de entrega', 'Zona León Centro', 21.1215, -101.6830],
  ['Farmacia San Miguel', 'Entrega de medicamento; acceso por la puerta lateral.', 'Punto de entrega', 'Zona León Centro', 21.1180, -101.6720],
  ['Oficina de atención NexLog Centro', 'Atención a clientes y recepción de paquetes en ventanilla.', 'Oficina administrativa', 'Zona León Centro', 21.1290, -101.6900],
  ['Bodega de insumos Norte', 'Resguardo de cajas y material de empaque para la zona norte.', 'Almacén', 'Zona León Norte', 21.1620, -101.6810],
  ['Distribuidora de calzado El Arco', 'Proveedor; recolección de cajas de calzado martes y jueves.', 'Punto de recolección', 'Zona León Norte', 21.1480, -101.6600],
  ['Abarrotes Don Chuy', 'Recibe pedidos por la mañana; tocar el timbre del portón.', 'Punto de entrega', 'Zona León Norte', 21.1700, -101.6950],
  ['Andén de carga Sur', 'Andén para carga y descarga de camiones de la ruta sur.', 'Almacén', 'Zona León Sur', 21.0820, -101.6600],
  ['Taller mecánico Los Pinos', 'Mantenimiento preventivo de camionetas de la flotilla.', 'Servicio vehicular', 'Zona León Sur', 21.0900, -101.6850],
  ['Mueblería Hogar del Bajío', 'Entregas voluminosas; requiere dos repartidores.', 'Punto de entrega', 'Zona León Sur', 21.0700, -101.6700],
  ['Curtiduría San José', 'Proveedor de piel; recolección de rollos los lunes.', 'Punto de recolección', 'Zona León Oriente', 21.1200, -101.6150],
  ['Ferretería El Tornillo', 'Cliente; recibe pedidos de 8:00 a 14:00 h.', 'Punto de entrega', 'Zona León Oriente', 21.1050, -101.6250],
  ['Estación de servicio Oriente', 'Carga de combustible para las unidades de la zona oriente.', 'Servicio vehicular', 'Zona León Oriente', 21.1300, -101.6000],
  ['Escuela Primaria Benito Juárez', 'Entrega de material didáctico en dirección escolar.', 'Punto de entrega', 'Zona León Poniente', 21.1250, -101.7400],
  ['Consultorio Dental Sonrisas', 'Entrega de insumos médicos; preguntar por recepción.', 'Punto de entrega', 'Zona León Poniente', 21.1400, -101.7250],
  ['Almacén temporal Poniente', 'Bodega de apoyo para temporada alta.', 'Almacén', 'Zona León Poniente', 21.1150, -101.7550],
];

const NOMBRES_ZONAS = [...new Set(UBICACIONES_BASE.map((u) => u[3]))];

function buildUbicacionesData(categoriasDocs, zonasDocs) {
  const categoriaPorNombre = new Map(categoriasDocs.map((doc) => [doc.nombre, doc]));
  const zonaPorNombre = new Map(zonasDocs.map((doc) => [doc.nombre, doc]));

  return UBICACIONES_BASE.map(([nombre, descripcion, categoria, zona, lat, lon]) => ({
    nombre,
    descripcion,
    categoria: categoriaPorNombre.get(categoria)._id,
    zona: zonaPorNombre.get(zona)._id,
    ubicacion: { type: 'Point', coordinates: [lon, lat] },
  }));
}

async function seedUbicaciones(categoriasDocs, zonasDocs) {
  const categorias = categoriasDocs || await buscarRequeridos(
    Categoria,
    CATEGORIAS_DATA.map((c) => c.nombre),
    'nombre',
    'seed:categorias',
  );
  const zonas = zonasDocs || await buscarRequeridos(ZonaReparto, NOMBRES_ZONAS, 'nombre', 'seed:zonas');
  return insertarFaltantes(Ubicacion, buildUbicacionesData(categorias, zonas));
}

if (require.main === module) {
  ejecutarSeed('ubicaciones', () => seedUbicaciones());
}

module.exports = { UBICACIONES_BASE, buildUbicacionesData, seedUbicaciones };
