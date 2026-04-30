const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   CACHE
=============================== */

const cache = new Map();
const CACHE_TTL = 60 * 1000;

const getCacheKey = (lat, lng) =>
  `${lat.toFixed(4)},${lng.toFixed(4)}`;

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

/* ===============================
   HELPERS
=============================== */

const getComponent = (components, types) => {
  for (let type of types) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return null;
};

const isMajorRoad = (street = "") =>
  /highway|hwy|freeway|fwy|road|rd/i.test(street);

/* ===============================
   DISTANCE
=============================== */

const getDistance = (a, b) => {
  if (!a || !b) return Infinity;

  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 *
      Math.cos(lat1) *
      Math.cos(lat2);

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

/* ===============================
   🚀 RESULT SELECTION (FIXED)
=============================== */

const GOOD_TYPES = [
  "street_address",
  "premise",
  "subpremise",
];

const BAD_KEYWORDS = [
  "service road",
  "service rd",
  "highway",
  "hwy",
  "freeway",
  "fwy",
];

const isBadAddress = (formatted = "") =>
  BAD_KEYWORDS.some((k) =>
    formatted.toLowerCase().includes(k)
  );

const pickBestResult = (results, origin) => {
  if (!results?.length) return null;

  const cleaned = results.filter(
    (r) => !isBadAddress(r.formatted_address)
  );

  const good = cleaned.filter((r) =>
    GOOD_TYPES.some((t) => r.types.includes(t))
  );

  const pool =
    good.length > 0
      ? good
      : cleaned.length > 0
      ? cleaned
      : results;

  const ranked = pool.map((r) => {
    const loc = r.geometry?.location;

    const point = {
      lat:
        typeof loc.lat === "function" ? loc.lat() : loc.lat,
      lng:
        typeof loc.lng === "function" ? loc.lng() : loc.lng,
    };

    const dist = origin ? getDistance(origin, point) : 0;

    return { r, dist };
  });

  ranked.sort((a, b) => a.dist - b.dist);

  return ranked[0].r;
};

/* ===============================
   PRECISION
=============================== */

const getPrecisionLevel = (accuracy, hasStreet) => {
  if (accuracy <= 20 && hasStreet) return 5;
  if (accuracy <= 50 && hasStreet) return 4;
  if (accuracy <= 200) return 3;
  if (accuracy <= 1000) return 2;
  return 1;
};

const getConfidence = (accuracy) => {
  if (accuracy <= 20) return "high";
  if (accuracy <= 100) return "medium";
  return "low";
};

/* ===============================
   ROAD SNAP
=============================== */

const snapToRoad = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://roads.googleapis.com/v1/nearestRoads?points=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    if (data.snappedPoints?.length) {
      const p = data.snappedPoints[0].location;

      return {
        lat: p.latitude,
        lng: p.longitude,
      };
    }
  } catch (err) {
    console.warn("snapToRoad failed:", err);
  }

  return { lat, lng };
};

/* ===============================
   OSM FALLBACK
=============================== */

async function resolveWithOSM(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );

    const data = await res.json();

    return {
      lat,
      lng,
      suburb: data.address?.suburb || data.address?.city,
      state: data.address?.state,
      label: data.display_name,
      fullLabel: data.display_name,
      precisionLevel: 3,
      confidence: "low",
      source: "osm",
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/* ===============================
   MAIN RESOLVER
=============================== */

export async function resolveLocation({
  lat,
  lng,
  accuracy = 999,
  placeId = null,
}) {
  try {
    const cacheKey = getCacheKey(lat, lng);
    const cached = getCached(cacheKey);
    if (cached) return cached;

    /* SNAP */
    if (accuracy > 30 && accuracy < 200) {
      const snapped = await snapToRoad(lat, lng);

      const moved = getDistance(
        { lat, lng },
        snapped
      );

      if (moved < 50) {
        lat = snapped.lat;
        lng = snapped.lng;
      }
    }

    let result;

    /* PLACE DETAILS */
    if (placeId) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();

      if (data.status === "OK") {
        result = {
          ...data.result,
          address_components: data.result.address_components,
          formatted_address: data.result.formatted_address,
          types: ["street_address"],
        };
      }
    }

    /* GEOCODE */
    if (!result) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();

      if (data.status !== "OK" || !data.results?.length) {
        throw new Error("Geocode failed");
      }

      result = pickBestResult(data.results, { lat, lng });
    }

    const components = result.address_components;

    const streetNumber = getComponent(components, ["street_number"]);
    const street = getComponent(components, ["route"]);

    const suburb = getComponent(components, [
      "locality",
      "sublocality",
      "administrative_area_level_2",
    ]);

    const city = getComponent(components, ["locality"]);
    const state = getComponent(components, ["administrative_area_level_1"]);
    const postcode = getComponent(components, ["postal_code"]);

    const finalSuburb = suburb || city || state;

    const fullStreet =
      streetNumber && street
        ? `${streetNumber} ${street}`
        : street;

    const hasStreet = !!fullStreet;
    const precisionLevel = getPrecisionLevel(accuracy, hasStreet);
    const confidence = getConfidence(accuracy);

    /* 🔥 CRITICAL FIX */
    let safeStreet = fullStreet;

    if (precisionLevel < 4 || confidence === "low") {
      safeStreet = null;
    }

    let label;
    let hint = null;

    if (precisionLevel >= 5 && confidence === "high") {
      label = result.formatted_address;
    } else if (precisionLevel >= 4 && safeStreet) {
      label = `${safeStreet}, ${finalSuburb}`;
    } else {
      label = `${finalSuburb || "Unknown"}, ${state || ""}`;

      if (street && !isMajorRoad(street)) {
        hint = `near ${street}`;
      }
    }

    const location = {
      lat,
      lng,
      accuracy,

      street: safeStreet,
      suburb: finalSuburb,
      city,
      state,
      postcode,

      label,
      fullLabel: result.formatted_address,
      hint,

      precisionLevel,
      confidence,
      source: placeId ? "places" : "google",

      updatedAt: Date.now(),
    };

    cache.set(cacheKey, {
      value: location,
      timestamp: Date.now(),
    });

    console.log("📍 Resolved location:", location);

    return location;

  } catch (err) {
    console.error("❌ resolveLocation failed:", err);

    const fallback = await resolveWithOSM(lat, lng);
    if (fallback) return fallback;

    return {
      lat,
      lng,
      accuracy,
      suburb: null,
      state: null,
      label: "Unknown location",
      fullLabel: null,
      hint: null,
      precisionLevel: 1,
      confidence: "low",
      source: "fallback",
      updatedAt: Date.now(),
    };
  }
}