import express from "express";

const router = express.Router();

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

const profile =
  profileResult.rows[0] || null;

      /* =========================
         PROFILE
      ========================= */

      const profile =
        user.profile || null;

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
            user.id,

          email:
            user.email ||

            user.attributes
              ?.email ||

            "",

          username:
            profile?.username ||
            "",

          display_name:
            profile?.display_name ||
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