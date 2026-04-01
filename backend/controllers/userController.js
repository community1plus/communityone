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
    const rawUser = req.user || {};

    const sub = (
      rawUser.userId ||
      rawUser.sub ||
      ""
    ).trim(); // 🔥 CRITICAL FIX

    const email =
      rawUser.signInDetails?.loginId ||
      rawUser.attributes?.email ||
      null;

    if (!sub) {
      console.error("❌ INVALID USER OBJECT:", rawUser);
      throw new Error("Missing user identifier (sub/userId)");
    }

    console.log("➡️ getMe using:", { sub, email });

    /* =========================
       🔥 SERVICE CALL
    ========================= */
    const result = await getOrCreateUserWithProfile(sub, email);

    const { user, profile, debug } = result;

    /* =========================
       ✅ RESPONSE
    ========================= */
    return res.json({
      user,
      profile,
      hasProfile: !!profile && profile.is_completed,

      // 🔥 TEMP DEBUG (REMOVE IN PROD)
      debug
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