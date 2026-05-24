function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat =
    (lat2 - lat1) * Math.PI / 180;

  const dLng =
    (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
}

export function generateGrid({
  centerLat,
  centerLng,
  radiusKm = 10,
  stepKm = 1,
}) {

  const points = [];

  const latStep =
    stepKm / 111;

  const lngStep =
    stepKm /
    (
      111 *
      Math.cos(
        centerLat * Math.PI / 180
      )
    );

  const latRadius =
    radiusKm / 111;

  const lngRadius =
    radiusKm /
    (
      111 *
      Math.cos(
        centerLat * Math.PI / 180
      )
    );

  for (
    let lat = centerLat - latRadius;
    lat <= centerLat + latRadius;
    lat += latStep
  ) {

    for (
      let lng = centerLng - lngRadius;
      lng <= centerLng + lngRadius;
      lng += lngStep
    ) {

      const distance =
        haversineKm(
          centerLat,
          centerLng,
          lat,
          lng
        );

      if (distance <= radiusKm) {
        points.push([lat, lng]);
      }
    }
  }

  return points;
}