import express from "express";
import { pool } from "../db/pool.js";
import { normalizeProfile } from "../utils/normalizeProfile.js";

const router = express.Router();

/* =========================
   GET CURRENT USER
========================= */

router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/me");

    if (!req.user) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const user = req.user;

    const tokenSub = user.sub || "";
    const tokenEmail =
      user.email ||
      user.attributes?.email ||
      "";

    const tokenUsername =
      user.username ||
      user["cognito:username"] ||
      user.attributes?.preferred_username ||
      tokenEmail.split("@")[0] ||
      "";

    console.log("🔐 /api/me token user:", {
      tokenSub,
      tokenEmail,
      tokenUsername,
    });

    /*
      First try exact Cognito sub match.
      Then fall back through the users table by email.
      This handles social login where the current Cognito sub
      differs from the original profile user_id.
    */
    const profileResult = await pool.query(
      `
      SELECT up.*
      FROM user_profiles up
      LEFT JOIN users u
        ON u.id = up.user_id
      WHERE
        up.user_id = $1
        OR LOWER(u.email) = LOWER($2)
        OR LOWER(up.username) = LOWER($3)
        OR LOWER(up.display_name) = LOWER($3)
      ORDER BY
        CASE
          WHEN up.user_id = $1 THEN 1
          WHEN LOWER(u.email) = LOWER($2) THEN 2
          WHEN LOWER(up.username) = LOWER($3) THEN 3
          WHEN LOWER(up.display_name) = LOWER($3) THEN 4
          ELSE 5
        END
      LIMIT 1
      `,
      [tokenSub, tokenEmail, tokenUsername]
    );

    const rawProfile = profileResult.rows[0] || null;

    console.log("👤 /api/me profile lookup:", {
      found: !!rawProfile,
      profileId: rawProfile?.id || null,
      profileUserId: rawProfile?.user_id || null,
      profileUsername: rawProfile?.username || null,
    });

    const profile = normalizeProfile(rawProfile);

    const social = profile?.social || {};

    const providers = {
      facebook: !!social?.facebook?.verified,
      instagram: !!social?.instagram?.verified,
      youtube: !!social?.youtube?.verified,
      x: !!social?.x?.verified,
    };

    return res.json({
      authenticated: true,

      user: {
        id: tokenSub,
        email: tokenEmail,
        username: profile?.username || tokenUsername || "",
        displayName:
          profile?.displayName ||
          profile?.display_name ||
          tokenUsername ||
          "",
        profileCompleted: !!profile,
      },

      profile,
      providers,
    });
  } catch (err) {
    console.error("❌ GET /api/me ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
});

export default router;