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
   HEALTH CHECK
===================================================== */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    console.error("❌ health error:", err.message);
    res.json({ status: "OK", db: "fallback" });
  }
});

/* =====================================================
   DEBUG ENDPOINTS
===================================================== */

app.get("/api/debug-count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM businesses");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ debug-count error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/debug-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ debug-db error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   BUSINESSES (MAP VIEW) ✅ FIXED
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
      WHERE ST_Intersects(
        location::geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
    `;

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    query += ` LIMIT ${limit}`;

    const result = await pool.query(query, values);

    console.log("📦 businesses rows:", result.rows.length);

    return res.json(result.rows);

  } catch (err) {
    console.error("❌ businesses error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   SEARCH (FIXED + SMART FALLBACK)
===================================================== */

app.get("/api/search", async (req, res) => {
  const { q, lat, lng, radius = 2000, category, limit = 50 } = req.query;

  if (!q || q.length < 2) return res.json([]);

  try {
    // 🔍 detect if search_vector exists
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'businesses'
      AND column_name = 'search_vector'
    `);

    const hasSearchVector = columnCheck.rows.length > 0;

    let values = [];
    let query = "";

    if (hasSearchVector) {
      // ✅ full-text
      values = [q];

      query = `
        SELECT id, name, address, rating,
               ST_Y(location::geometry) AS lat,
               ST_X(location::geometry) AS lng,
               ts_rank(search_vector, plainto_tsquery($1)) AS rank
        FROM businesses
        WHERE search_vector @@ plainto_tsquery($1)
      `;

    } else {
      // ✅ fallback
      values = [`%${q}%`];

      query = `
        SELECT id, name, address, rating,
               ST_Y(location::geometry) AS lat,
               ST_X(location::geometry) AS lng,
               0 AS rank
        FROM businesses
        WHERE name ILIKE $1
      `;
    }

    let idx = values.length + 1;

    // 📍 GEO filter
    if (lat && lng) {
      query += `
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($${idx},$${idx + 1}),4326)::geography,
          $${idx + 2}
        )
      `;
      values.push(lng, lat, radius);
      idx += 3;
    }

    // 📂 category
    if (category) {
      query += ` AND category = $${idx}`;
      values.push(category);
      idx++;
    }

    query += `
      ORDER BY rank DESC NULLS LAST, rating DESC NULLS LAST
      LIMIT ${Math.min(parseInt(limit) || 50, 100)}
    `;

    const result = await pool.query(query, values);

    console.log(
      `🔎 search (${hasSearchVector ? "FTS" : "ILIKE"}) →`,
      result.rows.length
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ search error FULL:", err);
    res.status(500).json({ error: err.message || "search failed" });
  }
});

/* =====================================================
   AUTOCOMPLETE
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
    res.status(500).json({ error: err.message });
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

async function ingestGoogle({ lat, lng }) {
  if (!GOOGLE_KEY) return;

  try {
    const res = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 2000,
          key: GOOGLE_KEY
        }
      }
    );

    for (const place of res.data.results) {
      await upsertBusiness({
        name: place.name,
        category: place.types?.[0] || "other",
        address: place.vicinity,
        rating: place.rating || null,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        source: "google",
        external_id: place.place_id
      });
    }

    console.log(`✅ Google ingest: ${res.data.results.length}`);

  } catch (err) {
    console.error("❌ Google ingest error:", err.message);
  }
}

/* =====================================================
   OSM INGEST
===================================================== */

async function ingestOSM({ lat, lng }) {
  try {
    const query = `
      [out:json];
      (
        node["amenity"](around:2000,${lat},${lng});
        node["shop"](around:2000,${lat},${lng});
      );
      out;
    `;

    const res = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    for (const el of res.data.elements) {
      const tags = el.tags || {};

      await upsertBusiness({
        name: tags.name || "Unknown",
        category: tags.amenity || tags.shop || "other",
        address: tags["addr:full"] || "",
        rating: null,
        lat: el.lat,
        lng: el.lon,
        source: "osm",
        external_id: el.id.toString()
      });
    }

    console.log(`✅ OSM ingest: ${res.data.elements.length}`);

  } catch (err) {
    console.error("❌ OSM ingest error:", err.message);
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