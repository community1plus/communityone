import express from "express";
import cors from "cors";
import businessesRoutes from "./routes/businesses.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ✅ Businesses API
app.use("/api/businesses", businessesRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});