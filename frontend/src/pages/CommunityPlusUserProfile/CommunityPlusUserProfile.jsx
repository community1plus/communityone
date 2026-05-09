const TABLE = "user_profiles";

function pickProfileFields(body = {}) {
  const data = {};

  if (body.username !== undefined) data.username = body.username;
  if (body.display_name !== undefined) data.display_name = body.display_name;
  if (body.userType !== undefined) data.user_type = body.userType;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.homeLocation !== undefined) data.home_location = body.homeLocation;
  if (body.social !== undefined) data.social = body.social;
  if (body.payment !== undefined) data.payment = body.payment;

  return data;
}

function normaliseProfile(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,
    username: profile.username,
    display_name: profile.display_name,
    userType: profile.user_type,
    phone: profile.phone,
    homeLocation: profile.home_location,
    social: profile.social || {},
    payment: profile.payment || {},
    version: profile.version,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        debug: { userId, table: TABLE },
      });
    }

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
      debug: {
        route: "GET /profile",
        userId,
        table: TABLE,
        savedSocial: profile.social,
      },
    });
  } catch (err) {
    console.error("Profile load failed:", err);
    return res.status(500).json({ error: "Profile load failed" });
  }
}

export async function putProfile(req, res) {
  try {
    const userId = req.user.userId;
    const data = pickProfileFields(req.body);

    const existing = await db(TABLE)
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

      await db(TABLE).insert(inserted);

      const profile = await db(TABLE)
        .where({ user_id: userId })
        .first();

      return res.status(201).json({
        profile: normaliseProfile(profile),
        version: profile.version,
        debug: {
          route: "PUT /profile",
          action: "insert",
          userId,
          table: TABLE,
          receivedBody: req.body,
          pickedData: data,
          savedSocial: profile.social,
        },
      });
    }

    const updated = {
      ...data,
      version: (existing.version || 1) + 1,
      updated_at: now,
    };

    const rowsUpdated = await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
      debug: {
        route: "PUT /profile",
        action: "update",
        userId,
        table: TABLE,
        rowsUpdated,
        existingUserId: existing.user_id,
        receivedBody: req.body,
        pickedData: data,
        updatePayload: updated,
        savedSocial: profile.social,
      },
    });
  } catch (err) {
    console.error("Profile save failed:", err);
    return res.status(500).json({
      error: "Profile save failed",
      debug: {
        message: err.message,
        stack: err.stack,
      },
    });
  }
}

export async function patchProfile(req, res) {
  try {
    const userId = req.user.userId;
    const patch = pickProfileFields(req.body);
    const clientVersion = req.headers["x-version"];

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
        debug: { userId, table: TABLE },
      });
    }

    if (clientVersion && Number(clientVersion) !== profile.version) {
      return res.status(409).json({
        error: "VERSION_CONFLICT",
        serverProfile: normaliseProfile(profile),
        serverVersion: profile.version,
        debug: {
          userId,
          clientVersion,
          serverVersion: profile.version,
        },
      });
    }

    const updated = {
      ...patch,
      version: (profile.version || 1) + 1,
      updated_at: new Date(),
    };

    const rowsUpdated = await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    const nextProfile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    return res.json({
      profile: normaliseProfile(nextProfile),
      version: nextProfile.version,
      debug: {
        route: "PATCH /profile",
        userId,
        table: TABLE,
        rowsUpdated,
        receivedBody: req.body,
        pickedPatch: patch,
        updatePayload: updated,
        savedSocial: nextProfile.social,
      },
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    return res.status(500).json({
      error: "Profile update failed",
      debug: {
        message: err.message,
        stack: err.stack,
      },
    });
  }
}