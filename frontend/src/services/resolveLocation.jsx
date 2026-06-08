const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   CACHE
=============================== */

const cache = new Map();
const CACHE_TTL = 60 * 1000;

const getCacheKey = (lat, lng) =>
  `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`;

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

const getComponent = (components = [], types = []) => {
  for (const type of types) {
    const match = components.find((c) =>
      c?.types?.includes(type)
    );

    if (match) return match.long_name;
  }

  return null;
};

const isMajorRoad = (street = "") =>
  /highway|hwy|freeway|fwy|road|rd/i.test(street);

const getLatLngFromResult = (result) => {
  const loc = result?.geometry?.location;

  return {
    lat:
      typeof loc?.lat === "function"
        ? loc.lat()
        : loc?.lat ?? null,

    lng:
      typeof loc?.lng === "function"
        ? loc.lng()
        : loc?.lng ?? null,
  };
};

/* ===============================
   DISTANCE
=============================== */

const getDistance = (a, b) => {
  if (!a || !b || a.lat == null || b.lat == null) {
    return Infinity;
  }

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
   RESULT FILTERING
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
    (r) => !isBadAddress(r?.formatted_address || "")
  );

  const rooftop = cleaned.filter(
    (r) => r.geometry?.location_type === "ROOFTOP"
  );

  const good = cleaned.filter((r) =>
    GOOD_TYPES.some((t) => r.types?.includes(t))
  );

  const pool =
    rooftop.length > 0
      ? rooftop
      : good.length > 0
      ? good
      : cleaned.length > 0
      ? cleaned
      : results;

  const ranked = pool.map((r) => {
    const point = getLatLngFromResult(r);
    const dist = origin ? getDistance(origin, point) : 0;

    return { r, dist };
  });

  ranked.sort((a, b) => a.dist - b.dist);

  return ranked[0]?.r || null;
};

/* ===============================
   PRECISION
=============================== */

const getPrecisionLevel = ({
  accuracy,
  locationType,
  hasStreet,
}) => {

  if (
    locationType === "ROOFTOP" &&
    accuracy <= 30
  ) {
    return 5;
  }

  if (
    locationType === "ROOFTOP" &&
    accuracy <= 75
  ) {
    return 4;
  }

  if (
    locationType === "ROOFTOP"
  ) {
    return 3;
  }

  if (locationType === "RANGE_INTERPOLATED") return 3;
  if (locationType === "GEOMETRIC_CENTER") return 2;
  if (locationType === "APPROXIMATE") return 1;

  return 1;
};

const getConfidence = ({
  accuracy,
  locationType,
}) => {

  if (
    locationType === "ROOFTOP" &&
    accuracy <= 30
  ) {
    return "high";
  }

  if (
    locationType === "ROOFTOP" &&
    accuracy <= 75
  ) {
    return "medium";
  }

  if (
    locationType === "ROOFTOP"
  ) {
    return "low";
  }

  if (accuracy <= 25) return "high";
  if (accuracy <= 100) return "medium";

  return "low";
};

/* ===============================
   SNAP TO ROAD
=============================== */

const snapToRoad = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://roads.googleapis.com/v1/nearestRoads?points=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    if (data?.snappedPoints?.length) {
      const p = data.snappedPoints[0].location;

      return {
        lat: p.latitude,
        lng: p.longitude,
      };
    }
  } catch (err) {
    console.warn("⚠️ snapToRoad failed:", err);
  }

  return { lat, lng };
};

/* ===============================
   OSM FALLBACK
=============================== */

async function resolveWithOSM(lat, lng, accuracy = 999) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );

    const data = await res.json();

    return {
      lat,
      lng,
      accuracy,
      accuracyMeters: accuracy,

      suburb:
        data?.address?.suburb ||
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        null,

      city:
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        null,

      state: data?.address?.state || null,
      country: data?.address?.country || null,
      postcode: data?.address?.postcode || null,

      label: data?.display_name || "Unknown location",
      fullAddress: data?.display_name || "",
      fullLabel: data?.display_name || "",

      locationType: "APPROXIMATE",
      isRooftop: false,
      precisionSource: "osm_fallback",

      precisionLevel: 2,
      confidence: "low",
      source: "osm",
      updatedAt: Date.now(),
    };
  } catch (e) {
    console.error("❌ OSM fallback failed", e);
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

    if (cached) {
      console.log("📦 Using cached location");
      return cached;
    }

    if (accuracy > 30 && accuracy < 200) {
      const snapped = await snapToRoad(lat, lng);
      const moved = getDistance({ lat, lng }, snapped);

      if (moved < 50) {
        lat = snapped.lat;
        lng = snapped.lng;
      }
    }

    let result = null;

    if (placeId) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address,geometry,name,types&key=${GOOGLE_API_KEY}`
        );

        const data = await res.json();

        if (data?.status === "OK" && data?.result) {
          result = {
            ...data.result,
            address_components:
              data.result.address_components || [],
            formatted_address:
              data.result.formatted_address || "",
            types: data.result.types || ["street_address"],
          };
        }
      } catch (e) {
        console.warn("⚠️ place details failed", e);
      }
    }

    if (!result) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=street_address|premise|subpremise|route|locality&key=${GOOGLE_API_KEY}`
        );

        const data = await res.json();

        if (data?.status === "OK" && data?.results?.length) {
          result = pickBestResult(data.results, { lat, lng });
        }
      } catch (e) {
        console.warn("⚠️ geocode failed", e);
      }
    }

    if (!result || !result.address_components) {
      throw new Error("No valid geocode result");
    }

    const components = result.address_components;

    const streetNumber = getComponent(components, ["street_number"]);
    const street = getComponent(components, ["route"]);

    const suburb = getComponent(components, [
      "locality",
      "sublocality",
      "sublocality_level_1",
      "administrative_area_level_2",
    ]);

    const city = getComponent(components, [
      "locality",
      "postal_town",
    ]);

    const state = getComponent(components, [
      "administrative_area_level_1",
    ]);

    const country = getComponent(components, ["country"]);
    const postcode = getComponent(components, ["postal_code"]);

    const finalSuburb = suburb || city || state;

    const fullStreet =
      streetNumber && street
        ? `${streetNumber} ${street}`
        : street;

    const hasStreet = Boolean(fullStreet);

    const locationType =
      result.geometry?.location_type || "UNKNOWN";

    const isRooftop = locationType === "ROOFTOP";

    const precisionLevel = getPrecisionLevel({
      accuracy,
      locationType,
      hasStreet,
    });

    const confidence = getConfidence({
      accuracy,
      locationType,
    });

    let safeStreet = fullStreet;

if (confidence === "low" && isMajorRoad(street)) {
  safeStreet = null;
}

    let label;
    let hint = null;

if (
  isRooftop &&
  accuracy <= 30 &&
  result.formatted_address
) {
  label = result.formatted_address;
}
else if (
  isRooftop &&
  accuracy <= 75 &&
  safeStreet &&
  finalSuburb
) {
  label = `${safeStreet}, ${finalSuburb}`;
}
else {
  label = `${finalSuburb || "Unknown"}, ${state || ""}`;
}

    const location = {
      lat,
      lng,

      accuracy,
      accuracyMeters: accuracy,

      street: safeStreet,
      suburb: finalSuburb,
      city,
      state,
      country,
      postcode,

      label,
      fullAddress: result.formatted_address || label,
      fullLabel: result.formatted_address || label,
      hint,

      locationType,
      isRooftop,
      precisionSource: placeId
        ? "places"
        : "reverse_geocode",

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
    console.error("❌ resolveLocation failed safely:", err);

    const fallback = await resolveWithOSM(lat, lng, accuracy);
    if (fallback) return fallback;

    return {
      lat,
      lng,
      accuracy,
      accuracyMeters: accuracy,

      suburb: null,
      city: null,
      state: null,
      country: null,
      postcode: null,

      label: "Unknown location",
      fullAddress: "",
      fullLabel: null,
      hint: null,

      locationType: "UNKNOWN",
      isRooftop: false,
      precisionSource: "fallback",

      precisionLevel: 1,
      confidence: "low",
      source: "fallback",
      updatedAt: Date.now(),
    };
  }
}