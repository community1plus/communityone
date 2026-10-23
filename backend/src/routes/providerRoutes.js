import express from "express";

const router = express.Router();

/* =========================
   GET PROVIDER STATUS
========================= */

router.get(
  "/",
  async (req, res) => {

    try {

      console.log(
        "📡 GET /api/me/providers"
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
         PROFILE SOCIAL
      ========================= */

      const social =
        req.user?.profile?.social || {};

      /* =========================
         PROVIDER MAP
      ========================= */

      const providers = {

        facebook: {

          verified:
            !!social?.facebook
              ?.verified,

          connected:
            !!social?.facebook
              ?.verified,

          accountName:
            social?.facebook
              ?.accountName || "",

          verifiedAt:
            social?.facebook
              ?.verifiedAt || null,
        },

        instagram: {

          verified:
            !!social?.instagram
              ?.verified,

          connected:
            !!social?.instagram
              ?.verified,

          accountName:
            social?.instagram
              ?.accountName ||

            social?.instagram
              ?.username ||

            "",

          verifiedAt:
            social?.instagram
              ?.verifiedAt || null,
        },

        youtube: {

          verified:
            !!social?.youtube
              ?.verified,

          connected:
            !!social?.youtube
              ?.verified,

          channelTitle:
            social?.youtube
              ?.channelTitle || "",

          verifiedAt:
            social?.youtube
              ?.verifiedAt || null,
        },

        x: {

          verified:
            !!social?.x
              ?.verified,

          connected:
            !!social?.x
              ?.verified,

          handle:
            social?.x
              ?.handle || "",

          verifiedAt:
            social?.x
              ?.verifiedAt || null,
        },
      };

      /* =========================
         RESPONSE
      ========================= */

      return res.json({
        authenticated: true,
        providers,
      });

    } catch (err) {

      console.error(
        "❌ GET /api/me/providers ERROR:",
        err
      );

      return res.status(500).json({
        error:
          "Failed to fetch provider status",
      });
    }
  }
);

export default router;