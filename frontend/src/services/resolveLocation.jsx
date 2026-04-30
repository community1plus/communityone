const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   CACHE (simple in-memory)
=============================== */

const cache = new Map();

const getCacheKey = (lat, lng) =>
  `${lat.toFixed(4)},${lng.toFixed(4)}`;

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
   PICK BEST RESULT (CRITICAL FIX)
=============================== */

const pickBestResult = (results) => {
  const priority = [
    "street_address",
    "premise",
    "subpremise",
    "route",
    "intersection",
    "locality",
    "postal_code",
    "administrative_area_level_2",
  ];

  for (let type of priority) {
    const match = results.find((r) => r.types.includes(type));
    if (match) return match;
  }

  return results[0];
};

/* ===============================
   PRECISION LEVEL (1–5)
=============================== */

const getPrecisionLevel = (result) => {
  if (result.types.includes("street_address")) return 5;
  if (result.types.includes("route")) return 4;
  if (result.types.includes("locality")) return 3;
  if (result.types.includes("administrative_area_level_1")) return 2;
  return 1;
};

/* ===============================
   MAIN RESOLVER
=============================== */

export async function resolveLocation({
  lat,
  lng,
  accuracy = 999,
  placeId = null, // 🔥 optional (from autocomplete)
}) {
  try {
    const cacheKey = getCacheKey(lat, lng);

    /* ===============================
       CACHE HIT
    =============================== */

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    let result;

    /* ===============================
       PLACE DETAILS (BEST ACCURACY)
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
       FALLBACK → GEOCODE
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
       EXTRACT FIELDS
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
       PRECISION LOGIC
    =============================== */

    const rawLevel = getPrecisionLevel(result);

    const effectiveLevel =
      accuracy > 200
        ? Math.min(rawLevel, 3)
        : accuracy > 100
        ? Math.min(rawLevel, 4)
        : rawLevel;

    const confidence =
      accuracy <= 50
        ? "high"
        : accuracy <= 200
        ? "medium"
        : "low";

    /* ===============================
       LABEL STRATEGY
    =============================== */

    let label;
    let hint = null;

    if (effectiveLevel >= 5 && confidence === "high") {
      label = result.formatted_address;
    } else if (effectiveLevel === 4) {
      label = `${fullStreet}, ${finalSuburb}`;
    } else if (effectiveLevel >= 3) {
      label = `${finalSuburb || "Unknown"}, ${state || ""}`;

      if (street && !isMajorRoad(street)) {
        hint = `near ${street}`;
      }
    } else {
      label = `${state || "Unknown location"}`;
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

      precisionLevel: effectiveLevel, // 🔥 1–5 scale
      confidence,
      source: placeId ? "places" : "gps+google",

      updatedAt: Date.now(),
    };

    /* ===============================
       CACHE STORE
    =============================== */

    cache.set(cacheKey, location);

    console.log("📍 Resolved location:", location);

    return location;
  } catch (err) {
    console.error("❌ resolveLocation failed:", err);

    return {
      lat,
      lng,
      accuracy,

      label: "Unknown location",
      precisionLevel: 1,
      confidence: "low",
      source: "fallback",

      updatedAt: Date.now(),
    };
  }
}