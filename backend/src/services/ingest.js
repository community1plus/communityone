import axios from "axios";
import { pool } from "../db/db.js";
import { ingestQueue } from "../../queue/ingestQueue.js";
import { dedupQueue } from "../../queue/dedupQueue.js";

/* =====================================================
   CONFIG
===================================================== */

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BATCH_SIZE = 100;
const GOOGLE_TYPES = ["restaurant", "cafe", "bar", "store"];

/* =====================================================
   HELPERS
===================================================== */

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(fn, retries = 3) {
  try {
    return await fn();
  } catch (err) {
    const status = err.response?.status;

    if (![429, 504].includes(status) || retries === 0) {
      throw err;
    }

    const delay = (4 - retries) * 2000;
    console.log(`⏳ Retry in ${delay}ms (status: ${status})`);

    await sleep(delay);
    return fetchWithRetry(fn, retries - 1);
  }
}

function normalizeName(name) {
  return name
    ?.toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =====================================================
   TILE GENERATOR
===================================================== */

export function generateTiles(center, step = 0.01, radius = 2) {
  const tiles = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      tiles.push({
        lat: center.lat + i * step,
        lng: center.lng + j * step
      });
    }
  }

  return tiles;
}

/* =====================================================
   BULK UPSERT
===================================================== */

async function bulkUpsertBusinesses(businesses) {
  if (!businesses.length) return;

  const values = [];
  const placeholders = [];

  businesses.forEach((biz, i) => {
    const idx = i * 9;

    placeholders.push(`
      ($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4},
       $${idx + 5}, $${idx + 6}, $${idx + 7},
       ST_SetSRID(ST_MakePoint($${idx + 7}, $${idx + 6}), 4326),
       $${idx + 8}, $${idx + 9})
    `);

    values.push(
      biz.name,
      biz.normalized_name,
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
    INSERT INTO businesses_raw
    (name, normalized_name, category, address, rating, lat, lng, location, source, external_id)
    VALUES ${placeholders.join(",")}
    ON CONFLICT (source, external_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      rating = GREATEST(businesses_raw.rating, EXCLUDED.rating),
      updated_at = NOW()
  `;

  await pool.query(query, values);
}

/* =====================================================
   GOOGLE INGEST
===================================================== */

export async function ingestGoogle({ lat, lng }) {
  console.log(`📍 Google ingest tile: ${lat}, ${lng}`);

  let allBusinesses = [];

  for (const type of GOOGLE_TYPES) {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 3000,
          type,
          key: GOOGLE_KEY
        }
      }
    );

    const places = res.data.results || [];

    const businesses = places.map((p) => ({
      name: p.name,
      normalized_name: normalizeName(p.name),
      category: type,
      address: p.vicinity,
      rating: p.rating || 0,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      source: "google",
      external_id: p.place_id
    }));

    allBusinesses.push(...businesses);
  }

  const uniqueMap = new Map();

  for (const biz of allBusinesses) {
    const key = `${biz.source}_${biz.external_id}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, biz);
  }

  const deduped = Array.from(uniqueMap.values());

  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    await bulkUpsertBusinesses(deduped.slice(i, i + BATCH_SIZE));
  }

  await dedupQueue.add("dedupe-tile", { lat, lng });
}

/* =====================================================
   OSM INGEST (THROTTLED)
===================================================== */

export async function ingestOSM({ lat, lng }) {
  console.log(`🌍 OSM ingest tile: ${lat}, ${lng}`);

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:800,${lat},${lng});
      node["shop"](around:800,${lat},${lng});
    );
    out;
  `;

  try {
    await sleep(1200);

    const res = await fetchWithRetry(() =>
      axios.post("https://overpass-api.de/api/interpreter", query, {
        headers: { "Content-Type": "text/plain" },
        timeout: 30000
      })
    );

    const nodes = res.data.elements || [];

    const businesses = nodes.map((n) => ({
      name: n.tags?.name || "Unknown",
      normalized_name: normalizeName(n.tags?.name || "unknown"),
      category: n.tags?.amenity || n.tags?.shop || "other",
      address: "OSM location",
      rating: 0,
      lat: n.lat,
      lng: n.lon,
      source: "osm",
      external_id: `osm_${n.id}`
    }));

    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      await bulkUpsertBusinesses(businesses.slice(i, i + BATCH_SIZE));
    }

    await dedupQueue.add("dedupe-tile", { lat, lng });

  } catch (err) {
    console.log("⚠️ OSM failed:", err.response?.status || err.message);
  }
}

/* =====================================================
   ENQUEUE
===================================================== */

export async function enqueueIngest({ lat, lng, source }) {
  await ingestQueue.add(
    "ingest-tile",
    { lat, lng, source },
    {
      jobId: `${lat}-${lng}-${source}`,
      removeOnComplete: true
    }
  );
}