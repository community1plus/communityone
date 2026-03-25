import axios from "axios";

/* =====================================================
   CONFIG
===================================================== */

const OSM_URL = "https://overpass-api.de/api/interpreter";
const MAX_RETRIES = 3;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* =====================================================
   🔥 RETRY WITH EXPONENTIAL BACKOFF
===================================================== */

async function fetchWithRetry(query, attempt = 1) {
  try {
    return await axios.post(OSM_URL, query, {
      headers: { "Content-Type": "text/plain" },
      timeout: 30000
    });
  } catch (err) {
    const status = err.response?.status;

    // 🔥 Retry on rate limit or timeout
    if ((status === 429 || status === 504) && attempt <= MAX_RETRIES) {
      const waitTime = attempt * 3000;

      console.log(
        `⏳ OSM retry ${attempt}/${MAX_RETRIES} in ${waitTime}ms (status: ${status})`
      );

      await delay(waitTime);

      return fetchWithRetry(query, attempt + 1);
    }

    throw err;
  }
}

/* =====================================================
   OSM INGEST
===================================================== */

export async function fetchOSMBusinesses(lat, lng) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:2000,${lat},${lng});
      node["shop"](around:2000,${lat},${lng});
    );
    out;
  `;

  try {
    const res = await fetchWithRetry(query);

    const elements = res.data.elements || [];

    console.log(`🌍 OSM fetched: ${elements.length}`);

    return elements.map((el) => ({
      name: el.tags?.name || "Unknown",
      category: el.tags?.amenity || el.tags?.shop || "other",
      lat: el.lat,
      lng: el.lon,
      address: el.tags?.["addr:street"] || "",
      source: "osm",
      external_id: `osm-${el.id}`
    }));

  } catch (err) {
    console.log(
      "⚠️ OSM failed after retries:",
      err.response?.status || err.message
    );

    // 🔥 graceful fallback (prevents pipeline crash)
    return [];
  }
}