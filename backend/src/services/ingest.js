import axios from "axios";
import { pool } from "../db/db.js";

/* =====================================================
   CONFIG
===================================================== */

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BATCH_SIZE = 100; // 🔥 now safe to increase

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* =====================================================
   🔥 BULK UPSERT (CORE ENGINE)
===================================================== */

async function bulkUpsertBusinesses(businesses) {
  if (!businesses.length) return;

  const values = [];
  const placeholders = [];

  businesses.forEach((biz, i) => {
    const idx = i * 8;

    placeholders.push(`
      ($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4},
       $${idx + 5}, $${idx + 6},
       ST_SetSRID(ST_MakePoint($${idx + 6}, $${idx + 5}), 4326),
       $${idx + 7}, $${idx + 8})
    `);

    values.push(
      biz.name,
      biz.category,
      biz.address,
      biz.rating,
      biz.lat,
      biz.lng,
      biz.source,
      biz.external_id
    );
  });

  const query = `
    INSERT INTO businesses
    (name, category, address, rating, lat, lng, location, source, external_id)
    VALUES ${placeholders.join(",")}
    ON CONFLICT (source, external_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      rating = EXCLUDED.rating,
      updated_at = NOW()
  `;

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error("❌ bulk upsert error:", err.message);
  }
}

/* =====================================================
   GOOGLE PLACES INGEST (🔥 BULK)
===================================================== */

export async function ingestGoogle({ lat, lng, radius = 2000, type = "restaurant" }) {

  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

  try {
    const res = await axios.get(url, {
      params: {
        location: `${lat},${lng}`,
        radius,
        type,
        key: GOOGLE_KEY
      }
    });

    const places = res.data.results || [];

    console.log(`📍 Google fetched: ${places.length}`);

    const businesses = places.map((p) => ({
      name: p.name,
      category: type,
      address: p.vicinity,
      rating: p.rating || 0,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      source: "google",
      external_id: p.place_id
    }));

    // 🔥 BULK INSERT IN CHUNKS
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const chunk = businesses.slice(i, i + BATCH_SIZE);
      await bulkUpsertBusinesses(chunk);
    }

    console.log(`✅ Google ingested: ${businesses.length}`);

  } catch (err) {
    console.error("❌ Google ingest failed:", err.message);
  }
}

/* =====================================================
   OSM INGEST (🔥 BULK + SAFE)
===================================================== */

export async function ingestOSM({ lat, lng }) {

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:800,${lat},${lng});
    );
    out;
  `;

  try {
    const res = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: { "Content-Type": "text/plain" },
        timeout: 30000
      }
    );

    const nodes = res.data.elements || [];

    console.log(`🌍 OSM fetched: ${nodes.length}`);

    const businesses = nodes.map((n) => ({
      name: n.tags?.name || "Unknown",
      category: n.tags?.amenity || "other",
      address: "OSM location",
      rating: 0,
      lat: n.lat,
      lng: n.lon,
      source: "osm",
      external_id: `osm_${n.id}`
    }));

    // 🔥 BULK INSERT IN CHUNKS
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const chunk = businesses.slice(i, i + BATCH_SIZE);
      await bulkUpsertBusinesses(chunk);
    }

    console.log(`✅ OSM ingested: ${businesses.length}`);

  } catch (err) {
    console.log("⚠️ OSM failed, skipping:", err.response?.status || err.message);
  }
}