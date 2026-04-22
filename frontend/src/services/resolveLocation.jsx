const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
   HELPERS
=============================== */

const getComponent = (components, types) => {
  for (let type of types) {
    const match = components.find(c => c.types.includes(type));
    if (match) return match.long_name;
  }
  return null;
};

// 🔥 Detect major roads (to avoid misleading labels)
const isMajorRoad = (street = "") => {
  return /highway|hwy|freeway|fwy|road|rd/i.test(street);
};

/* ===============================
   MAIN RESOLVER
=============================== */

export async function resolveLocation({ lat, lng, accuracy = 999 }) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    /* ===============================
       HANDLE GOOGLE STATUS
    =============================== */

    if (data.status !== "OK") {
      console.error("❌ Google Geocode status:", data.status);

      if (data.status === "REQUEST_DENIED") {
        throw new Error("Geocode API denied (check API key)");
      }

      if (data.status === "OVER_QUERY_LIMIT") {
        throw new Error("Geocode quota exceeded");
      }

      if (data.status === "ZERO_RESULTS") {
        console.warn("⚠️ No address found for coordinates");

        return {
          lat,
          lng,
          accuracy,
          suburb: null,
          state: null,
          label: "Approx location",
          fullLabel: null,
          hint: null,
          precision: accuracy <= 200 ? "medium" : "low",
          source: "coords-only",
          updatedAt: Date.now(),
        };
      }
    }

    if (!data.results || !data.results.length) {
      throw new Error("No geocode results");
    }

    const result = data.results[0];
    const components = result.address_components;

    /* ===============================
       EXTRACT FIELDS
    =============================== */

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

    /* ===============================
       PRECISION (ACCURACY + ADDRESS)
    =============================== */

    let precision = "low";

    if (street && finalSuburb && accuracy <= 50) {
      precision = "high";
    } else if (finalSuburb && accuracy <= 200) {
      precision = "medium";
    } else {
      precision = "low";
    }

    /* ===============================
       🔥 SMART LABEL STRATEGY (UPGRADED)
    =============================== */

    let label;
    let hint = null;

    if (precision === "high") {
      // Only show full address if VERY confident
      label = result.formatted_address;
    } else if (precision === "medium") {
      // Suburb only (avoid misleading street names)
      label = `${finalSuburb || "Unknown"}, ${state || ""}`;

      // Only show hint if NOT a major road
      if (street && !isMajorRoad(street)) {
        hint = `near ${street}`;
      }
    } else {
      // Low precision → broad only
      label = `${finalSuburb || "Unknown"}, ${state || ""}`;
    }

    /* ===============================
       FINAL OBJECT
    =============================== */

    const location = {
      lat,
      lng,
      accuracy,

      street,
      suburb: finalSuburb,
      city,
      state,
      postcode,

      label,
      fullLabel: result.formatted_address,
      hint,

      precision,
      source: "gps+google",
      updatedAt: Date.now(),
    };

    console.log("📍 Resolved location:", location);

    return location;

  } catch (err) {
    console.error("❌ resolveLocation failed:", err);

    return {
      lat,
      lng,
      accuracy,

      suburb: null,
      state: null,

      label: "Unknown location",
      fullLabel: null,
      hint: null,

      precision: accuracy <= 200 ? "medium" : "low",
      source: "fallback",
      updatedAt: Date.now(),
    };
  }
}