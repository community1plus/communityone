export function generateGrid({
  centerLat,
  centerLng,
  radiusKm = 10,
  stepKm = 1
}) {
  const points = [];

  const latStep = stepKm / 111; // ~km to degrees
  const lngStep = stepKm / (111 * Math.cos(centerLat * Math.PI / 180));

  for (let lat = centerLat - radiusKm / 111; lat <= centerLat + radiusKm / 111; lat += latStep) {
    for (let lng = centerLng - radiusKm / 111; lng <= centerLng + radiusKm / 111; lng += lngStep) {
      points.push([lat, lng]);
    }
  }

  return points;
}