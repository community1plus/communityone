import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/businesses", (req, res) => {
  const { lat, lng, category } = req.query;

  console.log("Incoming query:", { lat, lng, category });

  res.json([
    {
      id: 1,
      name: "Melbourne Cafe",
      address: "123 Collins St",
      lat: -37.8136,
      lng: 144.9631,
      category: "cafe",
      rating: 4.5
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});