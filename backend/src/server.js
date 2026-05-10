import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const { Pool } = pkg;
const app = express();

/* =========================
   GLOBAL ERROR HANDLERS
========================= */

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "https://main.d1ss8rtrtimogr.amplifyapp.com",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-version"],
  })
);

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  console.log("📡 REQUEST:", req.method, req.originalUrl);
  next();
});

/* =========================
   ENV DEBUG
========================= */

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is MISSING — app will fail");
} else {
  const safeUrl = dbUrl.replace(/\/\/.*:.*@/, "//****:****@");
  console.log("🔐 DATABASE_URL:", safeUrl);
}

/* =========================
   DATABASE TEST
========================= */

const pool = new Pool({
  connectionString: dbUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

/* =========================
   HEALTH / TEST
========================= */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch {
    res.json({ status: "OK", db: "failed" });
  }
});

app.get("/api/route-check", (req, res) => {
  res.json({
    version: "route-check-2026-05-10",
    profileMount: "/api/profile",
  });
});

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   ROUTES
========================= */

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

console.log("✅ Routes mounted:");
console.log("   → /api/users");
console.log("   → /api/profile");

/* =========================
   404 FALLBACK
========================= */

app.use((req, res) => {
  console.warn("404 ROUTE NOT FOUND:", req.method, req.originalUrl);

  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});