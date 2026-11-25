"use strict";

function isPosition(position) {
  if (!Array.isArray(position) || position.length !== 2) return false;
  const [longitude, latitude] = position;
  return Number.isFinite(longitude) && Number.isFinite(latitude) &&
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
}

function isLineString(coordinates) {
  return Array.isArray(coordinates) && coordinates.length >= 2 && coordinates.every(isPosition);
}

function isClosedLinearRing(ring) {
  if (!Array.isArray(ring) || ring.length < 4 || !ring.every(isPosition)) return false;
  const [firstLongitude, firstLatitude] = ring[0];
  const [lastLongitude, lastLatitude] = ring[ring.length - 1];
  return firstLongitude === lastLongitude && firstLatitude === lastLatitude;
}

function isPolygon(coordinates) {
  return Array.isArray(coordinates) && coordinates.length > 0 && coordinates.every(isClosedLinearRing);
}

function validateGeoJSON(type, coordinates) {
  const valid = type === 'Point'
    ? isPosition(coordinates)
    : type === 'LineString'
      ? isLineString(coordinates)
      : type === 'Polygon'
        ? isPolygon(coordinates)
        : false;

  return valid ? null : `Geometría GeoJSON ${type || 'desconocida'} inválida.`;
}

module.exports = { isPosition, isLineString, isPolygon, validateGeoJSON };
