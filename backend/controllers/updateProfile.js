const TABLE = "user_profiles";

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
  const data = {};

  if (body.username !== undefined) data.username = body.username;
  if (body.display_name !== undefined)
    data.display_name = body.display_name;

  if (body.userType !== undefined)
    data.user_type = body.userType;

  if (body.phone !== undefined)
    data.phone = body.phone;

  if (body.homeLocation !== undefined)
    data.home_location = body.homeLocation;

  if (body.social !== undefined)
    data.social = body.social;

  if (body.payment !== undefined)
    data.payment = body.payment;

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

/* =========================
   GET /profile
========================= */

export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    console.log("=================================");
    console.log("GET /profile");
    console.log("Authenticated userId:", userId);
    console.log("TABLE:", TABLE);

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    console.log(
      "Fetched profile:",
      JSON.stringify(profile, null, 2)
    );

    if (!profile) {
      console.log("No profile found for user");

      return res.status(404).json({
        error: "Profile not found",
      });
    }

    console.log("Returning profile to frontend");

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
    });
  } catch (err) {
    console.error("Profile load failed:", err);

    return res.status(500).json({
      error: "Profile load failed",
    });
  }
}

/* =========================
   PUT /profile
========================= */

export async function putProfile(req, res) {
  try {
    const userId = req.user.userId;

    console.log("=================================");
    console.log("PUT /profile");
    console.log("Authenticated userId:", userId);
    console.log("TABLE:", TABLE);

    console.log(
      "Raw request body:",
      JSON.stringify(req.body, null, 2)
    );

    const data = pickProfileFields(req.body);

    console.log(
      "Picked profile data:",
      JSON.stringify(data, null, 2)
    );

    const existing = await db(TABLE)
      .where({ user_id: userId })
      .first();

    console.log(
      "Existing profile:",
      JSON.stringify(existing, null, 2)
    );

    const now = new Date();

    /* =========================
       CREATE PROFILE
    ========================= */

    if (!existing) {
      console.log("Creating new profile");

      const inserted = {
        user_id: userId,
        ...data,
        version: 1,
        created_at: now,
        updated_at: now,
      };

      console.log(
        "Insert payload:",
        JSON.stringify(inserted, null, 2)
      );

      await db(TABLE).insert(inserted);

      const profile = await db(TABLE)
        .where({ user_id: userId })
        .first();

      console.log(
        "Inserted profile:",
        JSON.stringify(profile, null, 2)
      );

      return res.status(201).json({
        profile: normaliseProfile(profile),
        version: profile.version,
      });
    }

    /* =========================
       UPDATE PROFILE
    ========================= */

    console.log("Updating existing profile");

    const updated = {
      ...data,
      version: (existing.version || 1) + 1,
      updated_at: now,
    };

    console.log(
      "Update payload:",
      JSON.stringify(updated, null, 2)
    );

    const updateResult = await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    console.log("Rows updated:", updateResult);

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    console.log(
      "Saved profile from DB:",
      JSON.stringify(profile, null, 2)
    );

    console.log(
      "Saved social field:",
      JSON.stringify(profile?.social, null, 2)
    );

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
    });
  } catch (err) {
    console.error("Profile save failed:", err);

    return res.status(500).json({
      error: "Profile save failed",
    });
  }
}

/* =========================
   PATCH /profile
========================= */

export async function patchProfile(req, res) {
  try {
    const userId = req.user.userId;

    console.log("=================================");
    console.log("PATCH /profile");
    console.log("Authenticated userId:", userId);
    console.log("TABLE:", TABLE);

    console.log(
      "Raw patch body:",
      JSON.stringify(req.body, null, 2)
    );

    const patch = pickProfileFields(req.body);

    console.log(
      "Picked patch data:",
      JSON.stringify(patch, null, 2)
    );

    const clientVersion = req.headers["x-version"];

    console.log("Client version:", clientVersion);

    const profile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    console.log(
      "Existing profile:",
      JSON.stringify(profile, null, 2)
    );

    if (!profile) {
      console.log("No profile found for PATCH");

      return res.status(404).json({
        error: "Profile not found",
      });
    }

    if (
      clientVersion &&
      Number(clientVersion) !== profile.version
    ) {
      console.log("VERSION CONFLICT");

      return res.status(409).json({
        error: "VERSION_CONFLICT",
        serverProfile: normaliseProfile(profile),
        serverVersion: profile.version,
      });
    }

    const updated = {
      ...patch,
      version: (profile.version || 1) + 1,
      updated_at: new Date(),
    };

    console.log(
      "PATCH update payload:",
      JSON.stringify(updated, null, 2)
    );

    const updateResult = await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    console.log("Rows updated:", updateResult);

    const nextProfile = await db(TABLE)
      .where({ user_id: userId })
      .first();

    console.log(
      "Updated profile:",
      JSON.stringify(nextProfile, null, 2)
    );

    console.log(
      "Updated social field:",
      JSON.stringify(nextProfile?.social, null, 2)
    );

    return res.json({
      profile: normaliseProfile(nextProfile),
      version: nextProfile.version,
    });
  } catch (err) {
    console.error("Profile update failed:", err);

    return res.status(500).json({
      error: "Profile update failed",
    });
  }
}