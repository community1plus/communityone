import { getOrCreateUserWithProfile } from "../services/userService.js";

export async function getMe(req, res) {
  const { sub, email } = req.user;

  try {
    const { user, profile } = await getOrCreateUserWithProfile(sub, email);

    res.json({
      user,
      profile,
      hasProfile: !!profile && profile.is_completed
    });

  } catch (err) {
    console.error("🔥 getMe FULL ERROR:", err); // 👈 ADD THIS
    console.log("👤 req.user:", req.user);
    res.status(500).json({ error: err.message }); // 👈 CHANGE THIS
  }
}