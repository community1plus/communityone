import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import { pool } from "../db/pool.js";

const router = express.Router();

function getAuthenticatedUserId(req) {
  return req.user?.userId || req.user?.sub || req.user?.id;
}

function normaliseProfile(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    username: row.username || "",
    display_name: row.display_name || "",
    userType: row.user_type || "PERSONAL",
    phone: row.phone || "",
    homeLocation: row.home_location || null,
    social: row.social || {},
    payment: row.payment || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildProfilePayload(body = {}) {
  return {
    username: body.username || "",
    display_name: body.display_name || "",
    user_type: body.userType || body.user_type || "PERSONAL",
    phone: body.phone || body.phoneE164 || "",
    home_location: body.homeLocation || body.home_location || null,
    social: body.social || {},
    payment: body.payment || {},
  };
}

/* ===============================
   GET /api/profile
=============================== */

router.get("/", requireAuth, async (req, res) => {
  try {
    
    console.log("👤 FULL REQ.USER:", req.user);
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing authenticated user" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM user_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    console.log("📄 PROFILE QUERY RESULT:", result.rows[0]);  
    const profile = normaliseProfile(result.rows[0]);

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        profile: null,
      });
    }

    return res.json({
      profile,
    });
  } catch (err) {
    console.error("❌ PROFILE FETCH ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   POST /api/profile
   create or update
=============================== */

router.post("/", requireAuth, async (req, res) => {
  return upsertProfile(req, res);
});

/* ===============================
   PUT /api/profile
   create or replace
=============================== */

router.put("/", requireAuth, async (req, res) => {
  return upsertProfile(req, res);
});

/* ===============================
   PATCH /api/profile
   partial update
=============================== */

router.patch("/", requireAuth, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing authenticated user" });
    }

    const existingResult = await pool.query(
      `
      SELECT *
      FROM user_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    const existing = existingResult.rows[0];

    if (!existing) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const incoming = buildProfilePayload(req.body);

    const merged = {
      username:
        req.body.username !== undefined ? incoming.username : existing.username,
      display_name:
        req.body.display_name !== undefined
          ? incoming.display_name
          : existing.display_name,
      user_type:
        req.body.userType !== undefined || req.body.user_type !== undefined
          ? incoming.user_type
          : existing.user_type,
      phone: req.body.phone !== undefined ? incoming.phone : existing.phone,
      home_location:
        req.body.homeLocation !== undefined || req.body.home_location !== undefined
          ? incoming.home_location
          : existing.home_location,
      social:
        req.body.social !== undefined ? incoming.social : existing.social || {},
      payment:
        req.body.payment !== undefined
          ? incoming.payment
          : existing.payment || {},
    };

    const result = await pool.query(
      `
      UPDATE user_profiles
      SET
        username = $2,
        display_name = $3,
        user_type = $4,
        phone = $5,
        home_location = $6,
        social = $7::jsonb,
        payment = $8::jsonb,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
      `,
      [
        userId,
        merged.username,
        merged.display_name,
        merged.user_type,
        merged.phone,
        merged.home_location ? JSON.stringify(merged.home_location) : null,
        JSON.stringify(merged.social || {}),
        JSON.stringify(merged.payment || {}),
      ]
    );

    return res.json({
      profile: normaliseProfile(result.rows[0]),
    });
  } catch (err) {
    console.error("❌ PROFILE PATCH ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   SHARED UPSERT
=============================== */

async function upsertProfile(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Missing authenticated user" });
    }

    const data = buildProfilePayload(req.body);

    const result = await pool.query(
      `
      INSERT INTO user_profiles
        (
          user_id,
          username,
          display_name,
          user_type,
          phone,
          home_location,
          social,
          payment,
          created_at,
          updated_at
        )
      VALUES
        ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,NOW(),NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        user_type = EXCLUDED.user_type,
        phone = EXCLUDED.phone,
        home_location = EXCLUDED.home_location,
        social = EXCLUDED.social,
        payment = EXCLUDED.payment,
        updated_at = NOW()
      RETURNING *
      `,
      [
        userId,
        data.username,
        data.display_name,
        data.user_type,
        data.phone,
        data.home_location ? JSON.stringify(data.home_location) : null,
        JSON.stringify(data.social || {}),
        JSON.stringify(data.payment || {}),
      ]
    );

    return res.json({
      profile: normaliseProfile(result.rows[0]),
    });
  } catch (err) {
    console.error("❌ PROFILE SAVE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export default router;