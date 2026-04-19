import { getOrCreateUserWithProfile } from "../src/services/userService.js";

export async function getMe(req, res) {
  try {
    /* =========================
       🔍 DEBUG INPUT
    ========================= */
    console.log("👤 req.user:", req.user);

    const rawUser = req.user || {};

    /* =========================
       🧠 NORMALISE USER
    ========================= */
    const sub = (
      rawUser.userId ||
      rawUser.sub ||
      ""
    ).trim();

    const email =
      rawUser.email ||
      rawUser.signInDetails?.loginId ||
      rawUser.attributes?.email ||
      null;

    if (!sub) {
      console.error("❌ INVALID USER OBJECT:", rawUser);
      return res.status(400).json({
        error: "Missing user identifier (sub/userId)",
        rawUser
      });
    }

    console.log("➡️ getMe using:", { sub, email });

    /* =========================
       🔥 SERVICE CALL (FIXED)
    ========================= */
    const result = await getOrCreateUserWithProfile(sub, email);

    const { user, profile, debug } = result;

    if (!user || !user.id) {
      throw new Error("User creation or retrieval failed");
    }

    /* =========================
       ✅ RESPONSE
    ========================= */
    return res.json({
      user,
      profile,
      hasProfile: !!profile && profile.is_completed,
      debug // 🔥 remove in production later
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