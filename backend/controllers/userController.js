import { getOrCreateUserWithProfile } from "../src/services/userService.js";

/* =====================================================
   GET CURRENT USER + PROFILE (🔥 VERSION READY)
===================================================== */

export async function getMe(req, res) {
  try {
    /* =========================
       🔐 AUTH CONTEXT
    ========================= */

    const { userId, email } = req.user || {};

    if (!userId) {
      console.error("❌ Missing userId from middleware");
      return res.status(401).json({
        error: "Unauthorized: invalid token",
      });
    }

    /* =========================
       🔥 SERVICE
    ========================= */

    const result = await getOrCreateUserWithProfile(
      userId,
      email
    );

    const user = result?.user || null;
    const profile = result?.profile || null;

    if (!user?.id) {
      throw new Error("User retrieval failed");
    }

    /* =========================
       🔥 ENSURE VERSION EXISTS
    ========================= */

    const safeProfile = profile
      ? {
          ...profile,
          version: profile.version ?? 1, // 🔥 CRITICAL
        }
      : null;

    /* =========================
       ✅ RESPONSE CONTRACT
    ========================= */

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
      },

      profile: safeProfile,

      hasProfile: !!safeProfile?.is_completed,
    });

  } catch (err) {
    /* =========================
       ❌ ERROR HANDLING
    ========================= */

    console.error("🔥 getMe ERROR:", {
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined,
    });

    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}