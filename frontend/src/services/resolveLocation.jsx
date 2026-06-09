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
    const match = components.find((c) => c?.types?.includes(type));
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

const getSafeSuburbLabel = ({ suburb, city, state }) => {
  const place = suburb || city;

  if (place && state) return `${place}, ${state}`;
  if (place) return place;
  if (state) return state;

  return "Unknown location";
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

  const candidates = results.map((r) => {
    const point = getLatLngFromResult(r);
    const dist = origin ? getDistance(origin, point) : 0;

    const types = r.types || [];
    const locationType = r.geometry?.location_type || "";
    const formatted = r.formatted_address || "";

    let score = 0;

    if (types.includes("street_address")) score += 60;
    if (types.includes("premise")) score += 50;
    if (types.includes("subpremise")) score += 45;
    if (types.includes("route")) score += 25;
    if (types.includes("locality")) score += 5;
    if (types.includes("postal_code")) score += 3;

    if (locationType === "ROOFTOP") score += 20;
    if (locationType === "RANGE_INTERPOLATED") score += 10;
    if (locationType === "APPROXIMATE") score -= 10;

    if (isBadAddress(formatted)) score -= 40;

    score -= Math.min(dist, 500) / 5;

    return {
      r,
      dist,
      score,
      formatted,
      types,
      locationType,
    };
  });

  candidates.sort((a, b) => b.score - a.score);

  console.log(
    "📍 GOOGLE GEOCODE CANDIDATES:",
    candidates.map((c) => ({
      address: c.formatted,
      types: c.types,
      locationType: c.locationType,
      distMeters: Math.round(c.dist),
      score: Math.round(c.score),
    }))
  );

  return candidates[0]?.r || null;
};

/* ===============================
   PRECISION & CONFIDENCE
=============================== */

const getPrecisionLevel = ({ accuracy, locationType }) => {
  if (locationType === "ROOFTOP") {
    if (accuracy <= 30) return "LEVEL_5";
    if (accuracy <= 200) return "LEVEL_4";
    return "LEVEL_3";
  }

  if (locationType === "RANGE_INTERPOLATED") return "LEVEL_3";
  if (locationType === "GEOMETRIC_CENTER") return "LEVEL_2";
  if (locationType === "APPROXIMATE") return "LEVEL_1";

  if (accuracy <= 25) return "LEVEL_4";
  if (accuracy <= 150) return "LEVEL_3";
  if (accuracy <= 1000) return "LEVEL_2";

  return "LEVEL_1";
};

const getConfidence = ({ accuracy, locationType }) => {
  if (locationType === "ROOFTOP") {
    if (accuracy <= 30) return "high";
    if (accuracy <= 200) return "medium";
    return "low";
  }

  if (locationType === "RANGE_INTERPOLATED") return "medium";
  if (locationType === "APPROXIMATE") return "low";

  if (accuracy <= 25) return "high";
  if (accuracy <= 100) return "medium";

  return "low";
};

/* ===============================
   OSM FALLBACK
=============================== */

async function resolveWithOSM(lat, lng, accuracy = 999) {
  try {
    console.log("🟠 OSM FALLBACK START:", {
      lat,
      lng,
      accuracy,
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );

    const data = await res.json();

    console.log("🟠 OSM RESPONSE:", {
      displayName: data?.display_name,
      address: data?.address,
    });

    const suburb =
      data?.address?.suburb ||
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      null;

    const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      suburb;

    const state = data?.address?.state || null;

    const safeLabel = getSafeSuburbLabel({
      suburb,
      city,
      state,
    });

    return {
      lat,
      lng,
      accuracy,
      accuracyMeters: accuracy,

      suburb,
      city,
      state,
      country: data?.address?.country || null,
      postcode: data?.address?.postcode || null,

      // Safe public display
      label: safeLabel,
      fullAddress: "",

      // Internal diagnostic only
      fullLabel: data?.display_name || "",

      locationType: "APPROXIMATE",
      isRooftop: false,
      precisionSource: "osm_fallback",

      precisionLevel: "LEVEL_1",
      confidence: "low",

      source: "osm",
      updatedAt: Date.now(),
    };
  } catch (e) {
    console.error("❌ OSM fallback failed:", e);
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
    console.log("🧭 RESOLVE LOCATION START:", {
      lat,
      lng,
      accuracy,
      placeId,
      hasGoogleKey: Boolean(GOOGLE_API_KEY),
    });

    const cacheKey = getCacheKey(lat, lng);
    const cached = getCached(cacheKey);

    if (cached) {
      console.log("📦 Using cached in-memory location:", cached);
      return cached;
    }

    let result = null;
    let precisionSource = "reverse_geocode";

    if (placeId) {
      try {
        const url =
          `https://maps.googleapis.com/maps/api/place/details/json` +
          `?place_id=${placeId}` +
          `&fields=address_components,formatted_address,geometry,name,types` +
          `&key=${GOOGLE_API_KEY}`;

        console.log("🔵 GOOGLE PLACE DETAILS REQUEST:", {
          placeId,
        });

        const res = await fetch(url);
        const data = await res.json();

        console.log("🔵 GOOGLE PLACE DETAILS RESPONSE:", {
          status: data?.status,
          errorMessage: data?.error_message || null,
          hasResult: Boolean(data?.result),
          result: data?.result,
        });

        if (data?.status === "OK" && data?.result) {
          result = {
            ...data.result,
            address_components:
              data.result.address_components || [],
            formatted_address:
              data.result.formatted_address || "",
            types: data.result.types || ["street_address"],
          };

          precisionSource = "places";
        }
      } catch (e) {
        console.warn("⚠️ Place details failed:", e);
      }
    }

    if (!result) {
      try {
        const url =
          `https://maps.googleapis.com/maps/api/geocode/json` +
          `?latlng=${lat},${lng}` +
          `&key=${GOOGLE_API_KEY}`;

        console.log("🔵 GOOGLE GEOCODE REQUEST:", {
          lat,
          lng,
          accuracy,
        });

        const res = await fetch(url);
        const data = await res.json();

        console.log("🔵 GOOGLE GEOCODE RESPONSE:", {
          status: data?.status,
          errorMessage: data?.error_message || null,
          resultsCount: data?.results?.length || 0,
        });

        if (data?.status === "OK" && data?.results?.length) {
          result = pickBestResult(data.results, { lat, lng });
        }
      } catch (e) {
        console.warn("⚠️ Google geocode failed:", e);
      }
    }

    if (!result || !result.address_components) {
      console.warn(
        "⚠️ No valid Google geocode result. Falling back to OSM."
      );

      return await resolveWithOSM(lat, lng, accuracy);
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

    const city = getComponent(components, ["locality", "postal_town"]);
    const state = getComponent(components, ["administrative_area_level_1"]);
    const country = getComponent(components, ["country"]);
    const postcode = getComponent(components, ["postal_code"]);

    const finalSuburb =
      suburb ||
      city ||
      state ||
      "Unknown Area";

    const streetLabel =
      streetNumber && street
        ? `${streetNumber} ${street}`
        : street || "";

    const locationType =
      result.geometry?.location_type || "APPROXIMATE";

    const isRooftop = locationType === "ROOFTOP";

    const safeLabel = getSafeSuburbLabel({
      suburb: finalSuburb,
      city,
      state,
    });

    const fullDisplayLabel =
      streetLabel && finalSuburb
        ? `${streetLabel}, ${finalSuburb}`
        : safeLabel;

    const output = {
      lat,
      lng,

      accuracy,
      accuracyMeters: accuracy,

      suburb: finalSuburb,
      city: city || finalSuburb,
      state,
      country,
      postcode,

      // Safe default public display
      label: safeLabel,

      // Detailed diagnostic display only
      fullAddress: result.formatted_address || fullDisplayLabel,
      fullLabel: result.formatted_address || fullDisplayLabel,

      street: streetLabel || null,

      locationType,
      isRooftop,
      precisionSource,

      precisionLevel: getPrecisionLevel({
        accuracy,
        locationType,
      }),

      confidence: getConfidence({
        accuracy,
        locationType,
      }),

      source: precisionSource === "places" ? "places" : "google",
      updatedAt: Date.now(),
    };

    console.log("✅ RESOLVE LOCATION OUTPUT:", output);

    cache.set(cacheKey, {
      timestamp: Date.now(),
      value: output,
    });

    return output;
  } catch (err) {
    console.error("❌ resolveLocation crash:", err);

    return await resolveWithOSM(lat, lng, accuracy);
  }
}