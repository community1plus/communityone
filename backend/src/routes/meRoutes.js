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

    /* =========================
       AUTH CHECK
    ========================= */

    if (!req.user) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    /* =========================
       TOKEN USER
    ========================= */

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
      "";

    const emailLocalPart =
      tokenEmail && tokenEmail.includes("@")
        ? tokenEmail.split("@")[0]
        : "";

    console.log("🔐 /api/me token user:", {
      tokenSub,
      tokenEmail,
      tokenUsername,
      emailLocalPart,
    });

    /* =========================
       PROFILE QUERY
    ========================= */

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
        OR LOWER(up.username) = LOWER($4)
        OR LOWER(up.display_name) = LOWER($4)
      ORDER BY
        CASE
          WHEN up.user_id = $1 THEN 1
          WHEN LOWER(u.email) = LOWER($2) THEN 2
          WHEN LOWER(up.username) = LOWER($4) THEN 3
          WHEN LOWER(up.display_name) = LOWER($4) THEN 4
          WHEN LOWER(up.username) = LOWER($3) THEN 5
          WHEN LOWER(up.display_name) = LOWER($3) THEN 6
          ELSE 7
        END
      LIMIT 1
      `,
      [
        tokenSub,
        tokenEmail,
        tokenUsername,
        emailLocalPart,
      ]
    );

 const rawProfile =
  profileResult.rows[0] || null;

console.log(
  "RAW PROFILE",
  JSON.stringify(rawProfile, null, 2)
);

let organisationProfile = null;

if (rawProfile?.id) {

  const orgResult = await pool.query(
    `
    SELECT *
    FROM organisation_profiles
    WHERE user_profile_id = $1
    LIMIT 1
    `,
    [rawProfile.id]
  );

  organisationProfile =
    orgResult.rows[0] || null;
}

const normalizedProfile =
  normalizeProfile(rawProfile);

console.log(
  "NORMALIZED PROFILE",
  JSON.stringify(
    normalizedProfile,
    null,
    2
  )
);

console.log(
  "ORG PROFILE",
  JSON.stringify(
    organisationProfile,
    null,
    2
  )
);

const profile = {
  ...normalizedProfile,
  organisationProfile,
  organisation:
    organisationProfile,
};

console.log(
  "FINAL PROFILE",
  JSON.stringify(
    profile,
    null,
    2
  )
);

console.log(
  "PROFILE LOOKUP",
  {
    found: !!rawProfile,
    profileId:
      rawProfile?.id || null,
    profileUserId:
      rawProfile?.user_id || null,
    profileUsername:
      rawProfile?.username || null,
  }
);
    /* =========================
       PROVIDERS
    ========================= */

    const social = profile?.social || {};

    const providers = {
      facebook: !!social?.facebook?.verified,
      instagram: !!social?.instagram?.verified,
      youtube: !!social?.youtube?.verified,
      x: !!social?.x?.verified,
    };

    /* =========================
       RESPONSE
    ========================= */

    return res.json({
      authenticated: true,

      user: {
        id: tokenSub,

        email: tokenEmail,

        username:
          profile?.username ||
          emailLocalPart ||
          tokenUsername ||
          "",

        displayName:
          profile?.displayName ||
          profile?.display_name ||
          emailLocalPart ||
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