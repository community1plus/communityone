const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   CACHE (with TTL)
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
   RESULT SELECTION
=============================== */

const pickBestResult = (results) => {
  return (
    results.find((r) => r.types.includes("street_address")) ||
    results.find((r) => r.types.includes("premise")) ||
    results.find((r) => r.types.includes("route")) ||
    results.find((r) => r.types.includes("locality")) ||
    results[0]
  );
};

/* ===============================
   PRECISION + CONFIDENCE
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
   🚀 ROAD SNAP (REAL IMPLEMENTATION)
=============================== */

const snapCache = new Map();
const SNAP_TTL = 60 * 1000;

const getSnapKey = (lat, lng) =>
  `${lat.toFixed(5)},${lng.toFixed(5)}`;

const snapToRoad = async (lat, lng) => {
  const key = getSnapKey(lat, lng);
  const cached = snapCache.get(key);

  if (cached && Date.now() - cached.ts < SNAP_TTL) {
    return cached.value;
  }

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
  } catch (err) {
    console.warn("⚠️ snapToRoad failed:", err);
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

    /* ===============================
       SMART ROAD SNAP
    =============================== */

    if (accuracy > 30 && accuracy < 200) {
      const snapped = await snapToRoad(lat, lng);

      const distanceMoved =
        Math.sqrt(
          Math.pow((snapped.lat - lat) * 111000, 2) +
          Math.pow((snapped.lng - lng) * 111000, 2)
        );

      if (distanceMoved < 50) {
        lat = snapped.lat;
        lng = snapped.lng;
      }
    }

    let result;

    /* ===============================
       PLACE DETAILS
    =============================== */

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

    /* ===============================
       GEOCODE FALLBACK
    =============================== */

    if (!result) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();

      if (data.status !== "OK" || !data.results?.length) {
        throw new Error("Geocode failed");
      }

      result = pickBestResult(data.results);
    }

    const components = result.address_components;

    /* ===============================
       EXTRACT
    =============================== */

    const streetNumber = getComponent(components, ["street_number"]);
    const street = getComponent(components, ["route"]);

    const suburb = getComponent(components, [
      "locality",
      "sublocality",
      "administrative_area_level_2",
    ]);

    const city = getComponent(components, ["locality"]);

    const state = getComponent(components, [
      "administrative_area_level_1",
    ]);

    const postcode = getComponent(components, ["postal_code"]);

    const finalSuburb = suburb || city || state;

    const fullStreet =
      streetNumber && street
        ? `${streetNumber} ${street}`
        : street;

    /* ===============================
       PRECISION
    =============================== */

    const hasStreet = !!fullStreet;
    const precisionLevel = getPrecisionLevel(accuracy, hasStreet);
    const confidence = getConfidence(accuracy);

    /* ===============================
       LABEL STRATEGY
    =============================== */

    let label;
    let hint = null;

    if (precisionLevel >= 5 && confidence === "high") {
      label = result.formatted_address;
    } else if (precisionLevel >= 4) {
      label = `${fullStreet}, ${finalSuburb}`;
    } else {
      label = `${finalSuburb || "Unknown"}, ${state || ""}`;

      if (street && !isMajorRoad(street)) {
        hint = `near ${street}`;
      }
    }

    /* ===============================
       FINAL OBJECT
    =============================== */

    const location = {
      lat,
      lng,
      accuracy,

      street: fullStreet,
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