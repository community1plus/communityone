import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

/**
 * TEMP DATA (replace with DB later)
 */
const businesses = Array.from({ length: 1000 }).map((_, i) => ({
  id: i + 1,
  name: `Business ${i + 1}`,
  category: ["restaurant", "cafe", "bar", "store"][i % 4],
  address: "Melbourne VIC",
  lat: -37.8136 + (Math.random() - 0.5) * 0.1,
  lng: 144.9631 + (Math.random() - 0.5) * 0.1,
  rating: (Math.random() * 5).toFixed(1)
}));

/**
 * HEALTH CHECK
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/**
 * BUSINESSES ENDPOINT (viewport-based)
 */
app.get("/api/businesses", (req, res) => {
  let { north, south, east, west, category, limit = 50 } = req.query;

  // 🔥 Convert to numbers
  north = parseFloat(north);
  south = parseFloat(south);
  east = parseFloat(east);
  west = parseFloat(west);
  limit = Math.min(parseInt(limit) || 50, 100); // max cap

  // 🚨 Guard: invalid bounds
  if (
    [north, south, east, west].some(v => isNaN(v))
  ) {
    console.log("⛔ Invalid bounds:", req.query);
    return res.json([]);
  }

  console.log("📍 Query:", { north, south, east, west, category });

  // 🔍 Filter by viewport
  let results = businesses.filter(b =>
    b.lat <= north &&
    b.lat >= south &&
    b.lng <= east &&
    b.lng >= west &&
    (!category || b.category === category)
  );

  // 🔥 Limit results (critical for scale)
  results = results.slice(0, limit);

  res.json(results);
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});