import { pool } from "../src/db/db.js";

const TABLE = "user_profiles";

const ACCOUNT_TYPES = ["PERSONAL", "ORG", "MIXED"];

/* =========================
   HELPERS
========================= */

function cleanString(value = "") {
  return String(value || "").trim();
}

function normaliseAccountType(value = "PERSONAL") {
  const clean = cleanString(value).toUpperCase();
  return ACCOUNT_TYPES.includes(clean) ? clean : "PERSONAL";
}

function mergeSocialState(existing = {}, incoming = {}) {
  return {
    facebook: { ...(existing.facebook || {}), ...(incoming.facebook || {}) },
    instagram: { ...(existing.instagram || {}), ...(incoming.instagram || {}) },
    youtube: { ...(existing.youtube || {}), ...(incoming.youtube || {}) },
    x: { ...(existing.x || {}), ...(incoming.x || {}) },
  };
}

function mergePaymentState(existing = {}, incoming = {}) {
  return {
    ...existing,
    ...incoming,
  };
}

function mergeEndpointState(existing = {}, incoming = {}) {
  return {
    ...existing,
    ...incoming,
  };
}

function getEndpointDetails(req, bodyEndpoint = {}) {
  const forwardedFor =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim();

  return {
    ...(bodyEndpoint || {}),

    ipAddress:
      forwardedFor ||
      req.headers["x-real-ip"] ||
      req.ip ||
      "",

    serverUserAgent:
      req.headers["user-agent"] || "",

    capturedAt:
      bodyEndpoint?.capturedAt ||
      new Date().toISOString(),
  };
}

function calculateProfileState(profile = {}) {
  const username = cleanString(profile.username);
  const displayName = cleanString(profile.display_name);
  const userType = normaliseAccountType(profile.user_type);

  const hasBasicProfile =
    Boolean(username) &&
    Boolean(displayName) &&
    Boolean(userType);

  if (!hasBasicProfile) {
    return {
      profile_level: 0,
      profile_status: "incomplete",
    };
  }

  if (userType === "PERSONAL") {
    return {
      profile_level: 1,
      profile_status: "basic_complete",
    };
  }

  if (
    ["ORG", "MIXED"].includes(userType) &&
    profile.business_verification_status === "verified"
  ) {
    return {
      profile_level: 3,
      profile_status: "verified",
    };
  }

  return {
    profile_level: 1,
    profile_status: "business_pending",
  };
}

/* =========================
   PICK PROFILE FIELDS
========================= */

function pickProfileFields(body = {}) {
  const data = {};

  if (body.username !== undefined) {
    data.username = cleanString(body.username);
  }

  if (body.displayName !== undefined) {
    data.display_name = cleanString(body.displayName);
  } else if (body.display_name !== undefined) {
    data.display_name = cleanString(body.display_name);
  }

  if (body.userType !== undefined) {
    data.user_type = normaliseAccountType(body.userType);
  } else if (body.user_type !== undefined) {
    data.user_type = normaliseAccountType(body.user_type);
  } else if (body.accountType !== undefined) {
    data.user_type = normaliseAccountType(body.accountType);
  } else if (body.account_type !== undefined) {
    data.user_type = normaliseAccountType(body.account_type);
  }

  if (body.phone !== undefined) {
    data.phone = cleanString(body.phone);
  }

  if (body.phoneE164 !== undefined) {
    data.phone_e164 = cleanString(body.phoneE164);
  }

  if (body.phoneDisplay !== undefined) {
    data.phone_display = cleanString(body.phoneDisplay);
  }

  if (body.phoneCountry !== undefined) {
    data.phone_country = cleanString(body.phoneCountry || "AU");
  }

  if (body.phoneVerified !== undefined) {
    data.phone_verified = Boolean(body.phoneVerified);
  }

  if (body.homeLocation !== undefined) {
    data.home_location = body.homeLocation;
  } else if (body.home_location !== undefined) {
    data.home_location = body.home_location;
  }

  if (body.social !== undefined) {
    data.social = body.social || {};
  }

  if (body.payment !== undefined) {
    data.payment = body.payment || {};
  }

  if (body.endpoint !== undefined) {
    data.endpoint = body.endpoint || {};
  }

  return data;
}

/* =========================
   ACCOUNT TYPE COMMIT RULES
========================= */

function applyAccountTypeRules(existing = {}, incoming = {}) {
  const next = {
    ...existing,
    ...incoming,
  };

  const requestedType = normaliseAccountType(
    incoming.user_type || existing.user_type || "PERSONAL"
  );

  const currentType = normaliseAccountType(
    existing.user_type || "PERSONAL"
  );

  if (requestedType === "PERSONAL") {
    next.user_type = "PERSONAL";
    next.pending_account_type = null;
    next.business_verification_status = "none";
    return next;
  }

  if (["ORG", "MIXED"].includes(requestedType)) {
    const hasVerifiedBusiness =
      existing.business_verification_status === "verified" ||
      incoming.business_verification_status === "verified";

    if (hasVerifiedBusiness) {
      next.user_type = requestedType;
      next.pending_account_type = null;
      next.business_verification_status = "verified";
      return next;
    }

    next.user_type = currentType || "PERSONAL";
    next.pending_account_type = requestedType;
    next.business_verification_status =
      existing.business_verification_status &&
      existing.business_verification_status !== "none"
        ? existing.business_verification_status
        : "draft";

    return next;
  }

  return next;
}

/* =========================
   NORMALISE PROFILE
========================= */

function normaliseProfile(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,

    username: profile.username || "",

    displayName: profile.display_name || "",
    display_name: profile.display_name || "",

    userType: profile.user_type || "PERSONAL",
    user_type: profile.user_type || "PERSONAL",

    accountType: profile.user_type || "PERSONAL",
    account_type: profile.user_type || "PERSONAL",

    phone: profile.phone || "",
    phoneE164: profile.phone_e164 || "",
    phoneDisplay: profile.phone_display || "",
    phoneCountry: profile.phone_country || "AU",
    phoneVerified: Boolean(profile.phone_verified),

    homeLocation: profile.home_location || null,
    home_location: profile.home_location || null,

    social: profile.social || {},
    payment: profile.payment || {},
    endpoint: profile.endpoint || {},

    profileLevel: profile.profile_level || 0,
    profile_level: profile.profile_level || 0,

    profileStatus: profile.profile_status || "incomplete",
    profile_status: profile.profile_status || "incomplete",

    pendingAccountType: profile.pending_account_type || null,
    pending_account_type: profile.pending_account_type || null,

    businessVerificationStatus:
      profile.business_verification_status || "none",

    business_verification_status:
      profile.business_verification_status || "none",

    version: profile.version || 1,

    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

/* =========================
   FETCH HELPERS
========================= */

async function fetchProfileByUserId(userId) {
  const result = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

function getUserId(req) {
  return req.user?.id || req.user?.sub;
}

/* =========================
   GET PROFILE
========================= */

export async function getProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const profile = await fetchProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    return res.json({
      profile: normaliseProfile(profile),
      version: profile.version,
    });
  } catch (err) {
    console.error("GET PROFILE FAILED:", err);

    return res.status(500).json({
      error: "Profile load failed",
    });
  }
}

/* =========================
   SAVE PROFILE
========================= */

async function saveProfile({ userId, incoming }) {
  const now = new Date();
  const existing = await fetchProfileByUserId(userId);

  const base = existing || {
    user_id: userId,
    username: "",
    display_name: "",
    user_type: "PERSONAL",
    phone: "",
    phone_e164: "",
    phone_display: "",
    phone_country: "AU",
    phone_verified: false,
    home_location: null,
    social: {},
    payment: {},
    endpoint: {},
    profile_level: 0,
    profile_status: "incomplete",
    pending_account_type: null,
    business_verification_status: "none",
    version: 0,
    created_at: now,
  };

  const mergedSocial = mergeSocialState(
    base.social || {},
    incoming.social || {}
  );

  const mergedPayment = mergePaymentState(
    base.payment || {},
    incoming.payment || {}
  );

  const mergedEndpoint = mergeEndpointState(
    base.endpoint || {},
    incoming.endpoint || {}
  );

  const merged = {
    ...base,
    ...incoming,
    social: mergedSocial,
    payment: mergedPayment,
    endpoint: mergedEndpoint,
    version: (base.version || 0) + 1,
    updated_at: now,
  };

  const accountResolved = applyAccountTypeRules(base, merged);
  const profileState = calculateProfileState(accountResolved);

  const finalProfile = {
    ...accountResolved,
    profile_level: profileState.profile_level,
    profile_status: profileState.profile_status,
    updated_at: now,
  };

  if (!existing) {
    const result = await pool.query(
      `
        INSERT INTO ${TABLE} (
          user_id,
          username,
          display_name,
          user_type,
          phone,
          phone_e164,
          phone_display,
          phone_country,
          phone_verified,
          home_location,
          social,
          payment,
          endpoint,
          profile_level,
          profile_status,
          pending_account_type,
          business_verification_status,
          version,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11::jsonb,
          $12::jsonb,
          $13::jsonb,
          $14,$15,$16,$17,
          $18,$19,$20
        )
        RETURNING *
      `,
      [
        finalProfile.user_id,
        finalProfile.username,
        finalProfile.display_name,
        finalProfile.user_type,
        finalProfile.phone,
        finalProfile.phone_e164,
        finalProfile.phone_display,
        finalProfile.phone_country,
        finalProfile.phone_verified,
        finalProfile.home_location
          ? JSON.stringify(finalProfile.home_location)
          : null,
        JSON.stringify(finalProfile.social || {}),
        JSON.stringify(finalProfile.payment || {}),
        JSON.stringify(finalProfile.endpoint || {}),
        finalProfile.profile_level,
        finalProfile.profile_status,
        finalProfile.pending_account_type,
        finalProfile.business_verification_status,
        finalProfile.version,
        finalProfile.created_at,
        finalProfile.updated_at,
      ]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `
      UPDATE ${TABLE}
      SET
        username = $1,
        display_name = $2,
        user_type = $3,
        phone = $4,
        phone_e164 = $5,
        phone_display = $6,
        phone_country = $7,
        phone_verified = $8,
        home_location = $9::jsonb,
        social = $10::jsonb,
        payment = $11::jsonb,
        endpoint = $12::jsonb,
        profile_level = $13,
        profile_status = $14,
        pending_account_type = $15,
        business_verification_status = $16,
        version = $17,
        updated_at = $18
      WHERE user_id = $19
      RETURNING *
    `,
    [
      finalProfile.username,
      finalProfile.display_name,
      finalProfile.user_type,
      finalProfile.phone,
      finalProfile.phone_e164,
      finalProfile.phone_display,
      finalProfile.phone_country,
      finalProfile.phone_verified,
      finalProfile.home_location
        ? JSON.stringify(finalProfile.home_location)
        : null,
      JSON.stringify(finalProfile.social || {}),
      JSON.stringify(finalProfile.payment || {}),
      JSON.stringify(finalProfile.endpoint || {}),
      finalProfile.profile_level,
      finalProfile.profile_status,
      finalProfile.pending_account_type,
      finalProfile.business_verification_status,
      finalProfile.version,
      finalProfile.updated_at,
      userId,
    ]
  );

  return result.rows[0];
}

/* =========================
   PUT PROFILE
========================= */

export async function putProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const incoming = pickProfileFields(req.body);

    incoming.endpoint = getEndpointDetails(
      req,
      req.body.endpoint
    );

    console.log(
  "🖥️ ENDPOINT CAPTURED",
  incoming.endpoint
);

    const saved = await saveProfile({
      userId,
      incoming,
    });

    return res.json({
      profile: normaliseProfile(saved),
      version: saved.version,
    });
  } catch (err) {
    console.error("PUT PROFILE FAILED:", err);

    return res.status(500).json({
      error: "Profile save failed",
      detail: err.message,
    });
  }
}

/* =========================
   PATCH PROFILE
========================= */

export async function patchProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const existing = await fetchProfileByUserId(userId);

    if (!existing) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    const incoming = pickProfileFields(req.body);

    incoming.endpoint = getEndpointDetails(
      req,
      req.body.endpoint
    );

    const saved = await saveProfile({
      userId,
      incoming,
    });

    return res.json({
      profile: normaliseProfile(saved),
      version: saved.version,
    });
  } catch (err) {
    console.error("PATCH PROFILE FAILED:", err);

    return res.status(500).json({
      error: "Profile update failed",
      detail: err.message,
    });
  }
}