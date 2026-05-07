const PROFILE_FIELDS = [
  "username",
  "display_name",
  "userType",
  "phone",
  "homeLocation",
  "social",
  "payment",
];

function pickProfileFields(body = {}) {
  return PROFILE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
}

function normaliseProfile(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,

    username: profile.username,
    display_name: profile.display_name,
    userType: profile.userType,
    phone: profile.phone,

    homeLocation: profile.homeLocation,
    social: profile.social,
    payment: profile.payment,

    version: profile.version,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

/* =========================
   GET /profile
========================= */

export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const profile = await db("profiles")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Profile load failed" });
  }
}

/* =========================
   PUT /profile
   create or replace
========================= */

export async function putProfile(req, res) {
  try {
    const userId = req.user.userId;
    const data = pickProfileFields(req.body);

    const existing = await db("profiles")
      .where({ user_id: userId })
      .first();

    const now = new Date();

    if (!existing) {
      const inserted = {
        user_id: userId,
        ...data,
        version: 1,
        created_at: now,
        updated_at: now,
      };

      await db("profiles").insert(inserted);

      const profile = await db("profiles")
        .where({ user_id: userId })
        .first();

      return res.status(201).json({
        profile: normaliseProfile(profile),
        version: profile.version,
      });
    }

    const updated = {
      ...data,
      version: existing.version + 1,
      updated_at: now,
    };

    await db("profiles")
      .where({ user_id: userId })
      .update(updated);

    const profile = await db("profiles")
      .where({ user_id: userId })
      .first();

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Profile save failed" });
  }
}

/* =========================
   PATCH /profile
   update existing only
========================= */

export async function patchProfile(req, res) {
  try {
    const userId = req.user.userId;
    const patch = pickProfileFields(req.body);
    const clientVersion = req.headers["x-version"];

    const profile = await db("profiles")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (clientVersion && Number(clientVersion) !== profile.version) {
      return res.status(409).json({
        error: "VERSION_CONFLICT",
        serverProfile: normaliseProfile(profile),
        serverVersion: profile.version,
      });
    }

    const updated = {
      ...patch,
      version: profile.version + 1,
      updated_at: new Date(),
    };

    await db("profiles")
      .where({ user_id: userId })
      .update(updated);

    const nextProfile = await db("profiles")
      .where({ user_id: userId })
      .first();

    return res.json({
      profile: normaliseProfile(nextProfile),
      version: nextProfile.version,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Profile update failed" });
  }
}