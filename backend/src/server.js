import express from "express";
import cors from "cors";
import pkg from "pg";
import axios from "axios";

const { Pool } = pkg;

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

/* =====================================================
   DATABASE CONNECTION
===================================================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =====================================================
   CONFIG
===================================================== */

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/* =====================================================
   TEMP FALLBACK DATA (kept for safety)
===================================================== */

const businesses = Array.from({ length: 1000 }).map((_, i) => ({
  id: i + 1,
  name: `Business ${i + 1}`,
  category: ["restaurant", "cafe", "bar", "store"][i % 4],
  address: "Melbourne VIC",
  lat: -37.8136 + (Math.random() - 0.5) * 0.1,
  lng: 144.9631 + (Math.random() - 0.5) * 0.1,
  rating: (Math.random() * 5).toFixed(1)
}));

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch {
    res.json({ status: "OK", db: "fallback" });
  }
});

/* =====================================================
   BUSINESSES ENDPOINT (DB + FALLBACK)
===================================================== */

app.get("/api/businesses", async (req, res) => {
  let { north, south, east, west, category, limit = 50 } = req.query;

  north = parseFloat(north);
  south = parseFloat(south);
  east = parseFloat(east);
  west = parseFloat(west);
  limit = Math.min(parseInt(limit) || 50, 200);

  if ([north, south, east, west].some(v => isNaN(v))) {
    console.log("⛔ Invalid bounds:", req.query);
    return res.json([]);
  }

  try {
    const values = [west, south, east, north];

    let query = `
      SELECT id, name, address, rating,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM businesses
      WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
    `;

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    query += ` LIMIT ${limit}`;

    const result = await pool.query(query, values);

    return res.json(result.rows);

  } catch (err) {
    console.error("❌ DB error, using fallback:", err.message);

    let results = businesses.filter(b =>
      b.lat <= north &&
      b.lat >= south &&
      b.lng <= east &&
      b.lng >= west &&
      (!category || b.category === category)
    );

    return res.json(results.slice(0, limit));
  }
});

/* =====================================================
   UPSERT (DEDUP CORE)
===================================================== */

async function upsertBusiness(biz) {
  try {
    await pool.query(
      `
      INSERT INTO businesses
      (name, category, address, rating, lat, lng, location, source, external_id)
      VALUES ($1,$2,$3,$4,$5,$6,
        ST_SetSRID(ST_MakePoint($6,$5),4326),
        $7,$8
      )
      ON CONFLICT (source, external_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        rating = EXCLUDED.rating,
        updated_at = NOW()
      `,
      [
        biz.name,
        biz.category,
        biz.address,
        biz.rating,
        biz.lat,
        biz.lng,
        biz.source,
        biz.external_id
      ]
    );
  } catch (err) {
    console.error("❌ upsert error:", err.message);
  }
}

/* =====================================================
   GOOGLE INGEST
===================================================== */

async function ingestGoogle({ lat, lng, radius = 2000, type = "restaurant" }) {

  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    {
      params: {
        location: `${lat},${lng}`,
        radius,
        type,
        key: GOOGLE_KEY
      }
    }
  );

  for (const p of res.data.results) {
    await upsertBusiness({
      name: p.name,
      category: type,
      address: p.vicinity,
      rating: p.rating || 0,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      source: "google",
      external_id: p.place_id
    });
  }

  console.log(`✅ Google ingested: ${res.data.results.length}`);
}

/* =====================================================
   OSM INGEST
===================================================== */

async function ingestOSM({ lat, lng }) {

  const query = `
    [out:json];
    (
      node(around:2000,${lat},${lng})["amenity"];
    );
    out;
  `;

  const res = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    { headers: { "Content-Type": "text/plain" } }
  );

  for (const n of res.data.elements) {
    await upsertBusiness({
      name: n.tags?.name || "Unknown",
      category: n.tags?.amenity || "other",
      address: "OSM location",
      rating: 0,
      lat: n.lat,
      lng: n.lon,
      source: "osm",
      external_id: `osm_${n.id}`
    });
  }

  console.log(`✅ OSM ingested: ${res.data.elements.length}`);
}

/* =====================================================
   INGEST ENDPOINT
===================================================== */

app.get("/api/ingest", async (req, res) => {
  const lat = parseFloat(req.query.lat) || -37.8136;
  const lng = parseFloat(req.query.lng) || 144.9631;

  try {
    await ingestGoogle({ lat, lng, type: "restaurant" });
    await ingestOSM({ lat, lng });

    res.json({ status: "ingestion complete" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ingestion failed" });
  }
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});