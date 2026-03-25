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
   TEMP FALLBACK DATA
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
   BUSINESSES (MAP VIEW)
===================================================== */

app.get("/api/businesses", async (req, res) => {
  let { north, south, east, west, category, limit = 50 } = req.query;

  north = parseFloat(north);
  south = parseFloat(south);
  east = parseFloat(east);
  west = parseFloat(west);
  limit = Math.min(parseInt(limit) || 50, 200);

  if ([north, south, east, west].some(v => isNaN(v))) {
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

  } catch {
    return res.json([]);
  }
});

/* =====================================================
   🔍 SEARCH (FULL TEXT + GEO)
===================================================== */

app.get("/api/search", async (req, res) => {
  const { q, lat, lng, radius = 2000, category, limit = 50 } = req.query;

  if (!q || q.length < 2) return res.json([]);

  try {
    const values = [q];
    let idx = 1;

    let query = `
      SELECT id, name, address, rating,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng,
             ts_rank(search_vector, plainto_tsquery($1)) AS rank
      FROM businesses
      WHERE search_vector @@ plainto_tsquery($1)
    `;

    if (lat && lng) {
      query += `
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,
          $4
        )
      `;
      values.push(lng, lat, radius);
      idx = 4;
    }

    if (category) {
      query += ` AND category = $${idx + 1}`;
      values.push(category);
    }

    query += `
      ORDER BY rank DESC, rating DESC
      LIMIT ${Math.min(parseInt(limit) || 50, 100)}
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("❌ search error:", err.message);
    res.json([]);
  }
});

/* =====================================================
   ⚡ AUTOCOMPLETE (FAST PREFIX SEARCH)
===================================================== */

app.get("/api/autocomplete", async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.length < 2) return res.json([]);

  try {
    const result = await pool.query(
      `
      SELECT name
      FROM businesses
      WHERE name ILIKE $1
      GROUP BY name
      ORDER BY COUNT(*) DESC
      LIMIT $2
      `,
      [`${q}%`, limit]
    );

    res.json(result.rows.map(r => r.name));

  } catch (err) {
    console.error("❌ autocomplete error:", err.message);
    res.json([]);
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
   INGEST ENDPOINT
===================================================== */

app.get("/api/ingest", async (req, res) => {
  const lat = parseFloat(req.query.lat) || -37.8136;
  const lng = parseFloat(req.query.lng) || 144.9631;

  try {
    await ingestGoogle({ lat, lng });
    await ingestOSM({ lat, lng });

    res.json({ status: "ingestion complete" });

  } catch {
    res.status(500).json({ error: "ingestion failed" });
  }
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});