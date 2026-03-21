export function isDuplicate(a, b) {
  const distance =
    Math.sqrt(
      Math.pow(a.lat - b.lat, 2) +
      Math.pow(a.lng - b.lng, 2)
    );

  const nameMatch =
    a.name.toLowerCase() === b.name.toLowerCase();

  return distance < 0.0005 && nameMatch;
}