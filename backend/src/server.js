import express from "express";
import cors from "cors";
import pkg from "pg";

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

  // 🚨 guard invalid bounds
  if ([north, south, east, west].some(v => isNaN(v))) {
    console.log("⛔ Invalid bounds:", req.query);
    return res.json([]);
  }

  console.log("📍 Query:", { north, south, east, west, category });

  try {
    /* ================= DB QUERY ================= */

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

    console.log(`✅ DB returned ${result.rows.length} results`);

    return res.json(result.rows);

  } catch (err) {
    console.error("❌ DB error, using fallback:", err.message);

    /* ================= FALLBACK ================= */

    let results = businesses.filter(b =>
      b.lat <= north &&
      b.lat >= south &&
      b.lng <= east &&
      b.lng >= west &&
      (!category || b.category === category)
    );

    results = results.slice(0, limit);

    return res.json(results);
  }
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});