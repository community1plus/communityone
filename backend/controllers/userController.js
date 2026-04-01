import { getOrCreateUserWithProfile } from "../services/userService.js";

export async function getMe(req, res) {
  try {
    const sub = req.user.userId || req.user.sub;
    const email = req.user.signInDetails?.loginId || null;

    if (!sub) {
      throw new Error("Missing user identifier");
    }

    const { user, profile } =
      await getOrCreateUserWithProfile(sub, email);

    res.json({
      user,
      profile,
      hasProfile: !!profile && profile.is_completed
    });

  } catch (err) {
    console.error("🔥 getMe FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}