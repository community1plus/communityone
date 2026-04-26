export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const patch = req.body;
    const clientVersion = req.headers["x-version"];

    const profile = await db("profiles")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    /* =========================
       🔥 VERSION CHECK
    ========================= */

    if (clientVersion && Number(clientVersion) !== profile.version) {
      return res.status(409).json({
        error: "VERSION_CONFLICT",
        serverProfile: profile,
        serverVersion: profile.version,
      });
    }

    /* =========================
       UPDATE
    ========================= */

    const updated = {
      ...profile,
      ...patch,
      version: profile.version + 1,
      updated_at: new Date(),
    };

    await db("profiles")
      .where({ user_id: userId })
      .update(updated);

    return res.json({
      profile: updated,
      version: updated.version,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
}