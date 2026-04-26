import { getOrCreateUserWithProfile } from "../src/services/userService.js";

export async function getMe(req, res) {
  try {
    /* =========================
       🔐 TRUSTED USER (FROM MIDDLEWARE)
    ========================= */

    const { sub, email } = req.user || {};

    if (!sub) {
      console.error("❌ Missing user.sub from middleware");
      return res.status(401).json({
        error: "Unauthorized: invalid token payload",
      });
    }

    console.log("➡️ getMe:", { sub, email });

    /* =========================
       🔥 SERVICE CALL
    ========================= */

    const { user, profile } =
      await getOrCreateUserWithProfile(sub, email);

    if (!user?.id) {
      throw new Error("User creation/retrieval failed");
    }

    /* =========================
       ✅ RESPONSE
    ========================= */

    return res.json({
      user,
      profile,
      hasProfile: !!profile?.is_completed,
    });

  } catch (err) {
    /* =========================
       ❌ ERROR HANDLING
    ========================= */

    console.error("🔥 getMe ERROR:", err);

    return res.status(500).json({
      error: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    });
  }
}