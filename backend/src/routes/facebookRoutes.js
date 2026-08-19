import express from "express";
import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();


/* =====================================================
   FACEBOOK / SOCIAL IDENTITY
===================================================== */

router.get(
  "/",
  requireAuth,
  async (req, res) => {

    try {

      return res.status(200).json({
        user: req.user,
      });

    } catch (err) {

      console.error(
        "[FACEBOOK] ERROR:",
        err
      );

      return res.status(500).json({
        error: "Facebook identity request failed",
        detail: err.message,
      });
    }
  }
);


export default router;