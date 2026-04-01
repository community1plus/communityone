import express from "express";
import cors from "cors";
import pkg from "pg";
import axios from "axios";
import userRoutes from "../routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const app = express();

/* =========================
   🔥 GLOBAL ERROR HANDLERS
========================= */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

/* =========================
   🔥 MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =====================================================
   🔍 DEBUG ENV (ENHANCED)
===================================================== */
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is MISSING — app will fail");
} else {
  // show only safe part (no password)
  const safeUrl = dbUrl.replace(/\/\/.*:.*@/, "//****:****@");
  console.log("🔐 DATABASE_URL:", safeUrl);
}

/* =====================================================
   DATABASE
===================================================== */

const pool = new Pool({
  connectionString: dbUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionTimeoutMillis: 5000
});

/* =====================================================
   🔥 DB LOCATION DEBUG (CRITICAL)
===================================================== */
pool.query("SELECT current_database(), inet_server_addr()")
  .then((res) => {
    console.log("🌍 BACKEND DB:", res.rows);
  })
  .catch((err) => {
    console.error("❌ DB LOCATION ERROR:", err);
  });

/* =====================================================
   🔥 DB CONNECTION TEST
===================================================== */
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

/* =====================================================
   🔥 USER ROUTES
===================================================== */
app.use("/api/users", userRoutes);
console.log("✅ userRoutes mounted at /api/users");

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
   🔥 BASIC TEST ROUTE
===================================================== */
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* =====================================================
   START SERVER
===================================================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});