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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}