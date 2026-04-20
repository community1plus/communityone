import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import userRoutes from "../routes/userRoutes.js";

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
app.use("/api/users", userRoutes);
console.log("✅ userRoutes mounted at /api/users");

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    res.json({ status: "OK", db: "failed" });
  }
});

/* =========================
   TEST ROUTE
========================= */
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

/* =====================================================
   PROFILE: CREATE / UPDATE
===================================================== */
app.post("/api/profile", async (req, res) => {
  try {
    const {
      user_id,
      username,
      display_name,
      user_type,
      phone,
      social,
      payment,
    } = req.body;

    console.log("📥 Incoming payload:", req.body);

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

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
        payment = EXCLUDED.payment,
        updated_at = NOW()
      RETURNING *
      `,
      [
        user_id,
        username,
        display_name,
        user_type,
        phone || null,
        JSON.stringify(social || {}),
        JSON.stringify(payment || {}),
      ]
    );

    console.log("✅ Profile saved:", result.rows[0]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PROFILE SAVE ERROR:", err);

    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

/* =====================================================
   PROFILE: GET
===================================================== */
app.get("/api/profile", async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("❌ FETCH PROFILE ERROR:", err);

    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});