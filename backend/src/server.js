import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";
import axios from "axios";

const { Pool } = pkg;

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

/* =====================================================
   DEBUG ENV (IMPORTANT)
===================================================== */

console.log("🔐 DATABASE_URL:", process.env.DATABASE_URL ? "LOADED ✅" : "MISSING ❌");

/* =====================================================
   DATABASE
===================================================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

/* =====================================================
   CONFIG
===================================================== */

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/* =====================================================
   HEALTH
===================================================== */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    console.error("❌ health:", err);
    res.json({ status: "OK", db: "failed" });
  }
});

/* =====================================================
   DEBUG
===================================================== */

app.get("/api/debug-count", async (req, res) => {
  try {
    const r = await pool.query("SELECT COUNT(*) FROM businesses");
    res.json(r.rows[0]);
  } catch (err) {
    console.error("❌ debug-count:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   MAP (FIXED GEO)
===================================================== */

app.get("/api/businesses", async (req, res) => {
  try {
    const north = parseFloat(req.query.north);
    const south = parseFloat(req.query.south);
    const east = parseFloat(req.query.east);
    const west = parseFloat(req.query.west);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    if ([north, south, east, west].some(isNaN)) {
      return res.json([]);
    }

    const result = await pool.query(
      `
      SELECT id, name, address, rating,
             ST_Y(location::geometry) AS lat,
             ST_X(location::geometry) AS lng
      FROM businesses
      WHERE ST_Intersects(
        location::geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      LIMIT $5
      `,
      [west, south, east, north, limit]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ businesses:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   🔍 CLEAN SEARCH
===================================================== */

app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q;
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || 2000;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    if (!q || q.length < 2) return res.json([]);

    const hasGeo = !isNaN(lat) && !isNaN(lng);

    let query = `
      SELECT
        id,
        name,
        address,
        rating,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng
        ${hasGeo ? `,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($2,$3),4326)::geography
        ) AS distance` : ``}
      FROM businesses
      WHERE name ILIKE $1
    `;

    const values = [`%${q}%`];

    if (hasGeo) {
      values.push(lng, lat, radius);

      query += `
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,
          $4
        )
      `;
    }

    query += `
      ORDER BY
        ${hasGeo ? "distance ASC," : ""}
        rating DESC NULLS LAST
      LIMIT ${limit}
    `;

    const result = await pool.query(query, values);

    console.log("🔎 search rows:", result.rows.length);

    res.json(result.rows);

  } catch (err) {
    console.error("❌ SEARCH ERROR:", err);
    res.status(500).json({
      error: err.message,
      detail: err.detail
    });
  }
});

/* =====================================================
   AUTOCOMPLETE
===================================================== */

app.get("/api/autocomplete", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);

    const result = await pool.query(
      `
      SELECT name
      FROM businesses
      WHERE name ILIKE $1
      GROUP BY name
      ORDER BY COUNT(*) DESC
      LIMIT 10
      `,
      [`${q}%`]
    );

    res.json(result.rows.map(r => r.name));

  } catch (err) {
    console.error("❌ autocomplete:", err);
    res.json([]);
  }
});

/* =====================================================
   UPSERT
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
    console.error("❌ upsert:", err.message);
  }
}

/* =====================================================
   INGEST (GOOGLE + OSM)
===================================================== */

app.get("/api/ingest", async (req, res) => {
  const lat = parseFloat(req.query.lat) || -37.8136;
  const lng = parseFloat(req.query.lng) || 144.9631;

  try {
    // Google
    if (GOOGLE_KEY) {
      const g = await axios.get(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        {
          params: { location: `${lat},${lng}`, radius: 2000, key: GOOGLE_KEY }
        }
      );

      for (const p of g.data.results) {
        await upsertBusiness({
          name: p.name,
          category: p.types?.[0],
          address: p.vicinity,
          rating: p.rating,
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
          source: "google",
          external_id: p.place_id
        });
      }

      console.log("✅ Google:", g.data.results.length);
    }

    // OSM
    const query = `
      [out:json];
      (
        node["amenity"](around:2000,${lat},${lng});
        node["shop"](around:2000,${lat},${lng});
      );
      out;
    `;

    const osm = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    for (const el of osm.data.elements) {
      const t = el.tags || {};

      await upsertBusiness({
        name: t.name || "Unknown",
        category: t.amenity || t.shop,
        address: t["addr:full"] || "",
        rating: null,
        lat: el.lat,
        lng: el.lon,
        source: "osm",
        external_id: el.id.toString()
      });
    }

    console.log("✅ OSM:", osm.data.elements.length);

    res.json({ status: "done" });

  } catch (err) {
    console.error("❌ ingest:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   START
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 running on ${PORT}`);
});