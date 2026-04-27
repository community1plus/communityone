import { getOrCreateUserWithProfile } from "../services/userService.js";

/* =====================================================
   GET CURRENT USER + PROFILE (FINAL STABLE)
===================================================== */

export async function getMe(req, res) {
  try {
    /* =========================
       🔐 AUTH CONTEXT
    ========================= */

    const userId = req.user?.sub;
    const email = req.user?.email;

    console.log("👤 getMe user:", { userId, email });

    if (!userId) {
      console.error("❌ Missing sub from auth middleware");

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
       🔥 NORMALISE PROFILE
    ========================= */

    const safeProfile = profile
      ? {
          ...profile,
          version: profile.version ?? 1,
        }
      : null;

    /* =========================
       ✅ RESPONSE CONTRACT
    ========================= */

    const response = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
      },
      profile: safeProfile,
      hasProfile: !!safeProfile?.is_completed,
    };

    console.log("✅ /me response:", {
      userId: user.id,
      hasProfile: response.hasProfile,
    });

    return res.status(200).json(response);

  } catch (err) {
    /* =========================
       ❌ ERROR HANDLING (SAFE)
    ========================= */

    console.error("🔥 getMe ERROR:", {
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined,
    });

    // 🔥 IMPORTANT: never break frontend auth flow
    return res.status(200).json({
      user: req.user || null,
      profile: null,
      hasProfile: false,
      degraded: true,
    });
  }
}