import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

/* ===============================
   ROUTE LOGGER (CRITICAL)
=============================== */
router.use((req, res, next) => {
  console.log("📡 USER ROUTE HIT:", req.method, req.originalUrl);
  next();
});

/* ===============================
   HEALTH CHECK (USER SCOPE)
=============================== */
router.get("/health", (req, res) => {
  res.json({ ok: true, scope: "users" });
});

/* ===============================
   👤 CURRENT USER (/me)
=============================== */
router.get("/me", requireAuth, async (req, res) => {
  try {
    console.log("🔐 /me handler reached");

    const result = await getMe(req, res);

    if (res.headersSent) return;

    return res.status(200).json({
      user: result?.user || req.user || null,
      hasProfile: result?.hasProfile ?? false,
      profile: result?.profile || null,
    });

  } catch (err) {
    console.error("❌ /me handler error:", err);

    return res.status(200).json({
      user: req.user || null,
      hasProfile: false,
      profile: null,
      degraded: true,
    });
  }
});

export default router;