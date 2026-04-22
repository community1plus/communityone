const GOOGLE_API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY;

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

/* ===============================
   MAIN RESOLVER
=============================== */

export async function resolveLocation({ lat, lng, accuracy }) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    /* ===============================
       🔥 HANDLE GOOGLE STATUS (CRITICAL)
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

    /* ===============================
       ENFORCE MINIMUM (SUBURB)
    =============================== */

    const finalSuburb = suburb || city || state;

    /* ===============================
       🔥 PRECISION (ACCURACY + ADDRESS)
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

      label: `${finalSuburb || "Unknown"}, ${state || ""}`,
      fullLabel: result.formatted_address,

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

      precision: accuracy <= 200 ? "medium" : "low",
      source: "fallback",
      updatedAt: Date.now(),
    };
  }
}