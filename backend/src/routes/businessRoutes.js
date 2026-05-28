import express from "express";

import {
  searchCommunityOneBusinesses,
} from "../services/sources/communityOneBusinessSearch.js";

const router = express.Router();

/* =========================================================
   SOURCE CHECK
========================================================= */

router.post(
  "/source-check",
  async (req, res) => {
    try {
      const {
        query,
        name,
        address,
        lat,
        lng,
        radiusMeters = 1500,
      } = req.body;

      console.log(
        "[SOURCE_CHECK]",
        {
          query,
          name,
          address,
          lat,
          lng,
          radiusMeters,
        }
      );

      /* =====================================================
         COMMUNITY ONE DB SEARCH
      ===================================================== */

      const matches =
        await searchCommunityOneBusinesses({
          query: query || name,
          lat,
          lng,
          radiusMeters,
        });

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(200).json({
        matches,
      });
    } catch (err) {
      console.error(
        "Business source check failed:",
        err
      );

      return res.status(500).json({
        message:
          "Business source check failed",
      });
    }
  }
);

export default router;