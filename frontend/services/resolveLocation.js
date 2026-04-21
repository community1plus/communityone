const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

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

export async function resolveLocation({ lat, lng }) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

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
       PRECISION
    =============================== */

    let precision = "low";

    if (street && finalSuburb) precision = "high";
    else if (finalSuburb) precision = "medium";

    /* ===============================
       FINAL OBJECT
    =============================== */

    const location = {
      lat,
      lng,

      street,
      suburb: finalSuburb,
      city,
      state,
      postcode,

      label: `${finalSuburb}, ${state}`,
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
      suburb: null,
      state: null,
      label: "Unknown location",
      precision: "low",
      source: "fallback",
      updatedAt: Date.now(),
    };
  }
}