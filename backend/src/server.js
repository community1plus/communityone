import express from "express";
import cors from "cors";
import pkg from "pg";
import axios from "axios";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const app = express();

/* =========================
   🔥 MIDDLEWARE (ADD THIS)
========================= */
app.use(cors());
app.use(express.json()); // ✅ REQUIRED for req.body

const PORT = process.env.PORT || 5000;

/* =====================================================
   DEBUG ENV (IMPORTANT)
===================================================== */

console.log("🔐 DATABASE_URL:", process.env.DATABASE_URL ? "LOADED ✅" : "MISSING ❌");

/* =====================================================
   DATABASE
===================================================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

/* =====================================================
   🔥 USER ROUTES (ADD THIS BLOCK)
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