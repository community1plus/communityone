import express from "express";
import { pool } from "../db/pool.js";
import { normalizeProfile } from "../utils/normalizeProfile.js";

const router = express.Router();

/* =========================
   PROFILE NORMALIZER
========================= */

normalizeProfile = (profile) => {

  if (!profile) return null;

  return {

    id:
      profile.id,

    userId:
      profile.user_id,

    username:
      profile.username ?? "",

    displayName:
      profile.display_name ?? "",

    userType:
      profile.user_type ?? "PERSONAL",

    phoneCountry:
      profile.phone_country ?? "AU",

    phone:
      profile.phone ?? "",

    bio:
      profile.bio ?? "",

    website:
      profile.website ?? "",

    avatarUrl:
      profile.avatar_url ?? "",

    social:
      profile.social ?? {},

    createdAt:
      profile.created_at,

    updatedAt:
      profile.updated_at,
  };
};

/* =========================
   GET CURRENT USER
========================= */

router.get(
  "/",
  async (req, res) => {

    try {

      console.log(
        "📡 GET /api/me"
      );

      /* =========================
         AUTH CHECK
      ========================= */

      if (!req.user) {

        return res.status(401).json({
          authenticated: false,
        });
      }

      /* =========================
         BASIC USER
      ========================= */

      const user =
        req.user;

      /* =========================
         PROFILE QUERY
      ========================= */

      const profileResult =
        await pool.query(
          `
          SELECT *
          FROM user_profiles
          WHERE user_id = $1
          LIMIT 1
          `,
          [user.sub]
        );

      const rawProfile =
        profileResult.rows[0] || null;

      const profile =
        normalizeProfile(rawProfile);

      /* =========================
         PROVIDERS
      ========================= */

      const social =
        profile?.social || {};

      const providers = {

        facebook:
          !!social?.facebook
            ?.verified,

        instagram:
          !!social?.instagram
            ?.verified,

        youtube:
          !!social?.youtube
            ?.verified,

        x:
          !!social?.x
            ?.verified,
      };

      /* =========================
         RESPONSE
      ========================= */

      return res.json({

        authenticated: true,

        user: {

          id:
            user.sub,

          email:
            user.email ||

            user.attributes
              ?.email ||

            "",

          username:
            profile?.username ||

            "",

          displayName:
            profile?.displayName ||

            "",

          profileCompleted:
            !!profile,
        },

        profile,

        providers,
      });

    } catch (err) {

      console.error(
        "❌ GET /api/me ERROR:",
        err
      );

      return res.status(500).json({

        error:
          "Failed to fetch current user",
      });
    }
  }
);

export default router;