import { getOrCreateUserWithProfile } from "../services/userService.js";

export async function getMe(req, res) {
  try {
    /* =========================
       🔍 DEBUG (VERY IMPORTANT)
    ========================= */
    console.log("👤 req.user:", req.user);

    /* =========================
       🧠 NORMALISE USER
    ========================= */
    const sub = req.user?.userId || req.user?.sub;
    const email =
      req.user?.signInDetails?.loginId ||
      req.user?.attributes?.email ||
      null;

    if (!sub) {
      throw new Error("Missing user identifier (sub/userId)");
    }

    console.log("➡️ getMe using:", { sub, email });

    /* =========================
       🔥 SERVICE CALL
    ========================= */
    const { user, profile } =
      await getOrCreateUserWithProfile(sub, email);

    /* =========================
       ✅ RESPONSE
    ========================= */
    return res.json({
      user,
      profile,
      hasProfile: !!profile && profile.is_completed
    });

  } catch (err) {
    /* =========================
       ❌ ERROR HANDLING
    ========================= */
    console.error("🔥 getMe FULL ERROR:", err);

    return res.status(500).json({
      error: err.message || "Unknown server error",
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined
    });
  }
}