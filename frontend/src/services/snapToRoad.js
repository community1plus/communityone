// snapToRoad.js

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   SNAP CACHE (prevents spam)
=============================== */

const snapCache = new Map();
const SNAP_TTL = 60 * 1000; // 1 min

const getSnapKey = (lat, lng) =>
  `${lat.toFixed(5)},${lng.toFixed(5)}`;

const getSnapCached = (key) => {
  const entry = snapCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.ts > SNAP_TTL) {
    snapCache.delete(key);
    return null;
  }

  return entry.value;
};

/* ===============================
   MAIN SNAP
=============================== */

export async function snapToRoad(lat, lng) {
  const key = getSnapKey(lat, lng);
  const cached = getSnapCached(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://roads.googleapis.com/v1/nearestRoads?points=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    if (data.snappedPoints?.length) {
      const p = data.snappedPoints[0].location;

      const snapped = {
        lat: p.latitude,
        lng: p.longitude,
      };

      snapCache.set(key, { value: snapped, ts: Date.now() });

      return snapped;
    }

    return { lat, lng };
  } catch (err) {
    console.warn("⚠️ snapToRoad failed:", err);
    return { lat, lng };
  }
}