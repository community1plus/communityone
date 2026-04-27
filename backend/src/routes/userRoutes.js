import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getMe } from "../../controllers/userController.js";

const router = express.Router();

/* ===============================
   👤 CURRENT USER (/me)
=============================== */

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await getMe(req, res);

    // 🔥 If controller already sent response, stop
    if (res.headersSent) return;

    // 🔥 Ensure consistent fallback response
    return res.status(200).json({
      user: result?.user || req.user || null,
      hasProfile: result?.hasProfile ?? false,
      profile: result?.profile || null,
    });

  } catch (err) {
    console.error("🔥 /me route error:", err);

    // 🔥 IMPORTANT: never send 500 for normal auth flows
    return res.status(200).json({
      user: req.user || null,
      hasProfile: false,
      profile: null,
      degraded: true, // 🔥 signal frontend if needed
    });
  }
});

export default router;