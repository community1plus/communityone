import express from "express";

const router = express.Router();

// TEMP: mock data (replace with DB soon)
const mockBusinesses = [
  {
    id: 1,
    name: "Melbourne Cafe",
    address: "123 Collins St",
    lat: -37.8136,
    lng: 144.9631,
    category: "cafe",
    rating: 4.5
  },
  {
    id: 2,
    name: "City Bar",
    address: "456 Swanston St",
    lat: -37.815,
    lng: 144.966,
    category: "bar",
    rating: 4.2
  },
  {
    id: 3,
    name: "Pizza Spot",
    address: "789 Flinders Ln",
    lat: -37.817,
    lng: 144.955,
    category: "restaurant",
    rating: 4.7
  }
];

// GET /api/businesses
router.get("/", (req, res) => {
  const { lat, lng, category } = req.query;

  if (!lat || !lng) {
    console.log("❌ Missing coords");
    return res.status(400).json({ error: "Missing coordinates" });
  }

  console.log("✅ Incoming query:", { lat, lng, category });

  let results = mockBusinesses;

  if (category) {
    results = results.filter(b => b.category === category);
  }

  res.json(results);
});

export default router;