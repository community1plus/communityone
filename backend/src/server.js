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
app.use(cors({
  origin: "https://main.d1ss8rtrtimogr.amplifyapp.com",
  credentials: true,
}));

app.options("*", cors());

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

const userId = req.body.user_id;

if (!userId) {
  return res.status(400).json({ error: "Missing user_id" });
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

app.post("/api/profile", async (req, res) => {
  try {
    const {
      username,
      display_name,
      user_type,
      phone,
      social,
      payment,
    } = req.body;

    // 🔥 TEMP: replace auth until wired
    const userId = "test-user-123";

    const result = await pool.query(
      `
      INSERT INTO user_profiles 
      (user_id, username, display_name, user_type, phone, social, payment)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        user_type = EXCLUDED.user_type,
        phone = EXCLUDED.phone,
        social = EXCLUDED.social,
        payment = EXCLUDED.payment
      RETURNING *
      `,
      [
        userId,
        username,
        display_name,
        user_type,
        phone,
        JSON.stringify(social || {}),
        JSON.stringify(payment || {}),
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ PROFILE SAVE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});