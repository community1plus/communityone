// services/tileGenerator.js

export function generateTiles(bounds, step = 0.2) {
  const tiles = [];

  for (let lat = bounds.south; lat < bounds.north; lat += step) {
    for (let lng = bounds.west; lng < bounds.east; lng += step) {
      tiles.push({
        lat: lat + step / 2,
        lng: lng + step / 2
      });
    }
  }

  return tiles;
}