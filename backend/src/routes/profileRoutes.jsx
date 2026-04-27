import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../db/pool.js"; // or wherever you export it

const router = express.Router();

/* ===============================
   PROFILE: SAVE
=============================== */
router.post("/", requireAuth, async (req, res) => {
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PROFILE SAVE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   PROFILE: GET
=============================== */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.query.user_id;

    const result = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("❌ PROFILE FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;