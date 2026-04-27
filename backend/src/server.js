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
    origin: "https://main.d1ss8rtrtimogr.amplifyapp.com",
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   🔍 GLOBAL REQUEST LOGGER (CRITICAL)
========================= */
app.use((req, res, next) => {
  console.log("📡 REQUEST:", req.method, req.url);
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
   DATABASE
========================= */
const pool = new Pool({
  connectionString: dbUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/* =========================
   DB TEST
========================= */
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

/* =========================
   ROUTES
========================= */

// 👤 Auth + user lifecycle
app.use("/api/users", userRoutes);

// 📇 Profile management (PROTECTED inside route)
app.use("/api/profile", profileRoutes);

console.log("✅ Routes mounted:");
console.log("   → /api/users");
console.log("   → /api/profile");

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch {
    res.json({ status: "OK", db: "failed" });
  }
});

/* =========================
   TEST ROUTE
========================= */
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});