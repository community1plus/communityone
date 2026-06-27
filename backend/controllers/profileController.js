import { pool } from "../src/db/db.js";

const TABLE = "user_profiles";

const ACCOUNT_TYPES = ["PERSONAL", "ORG", "MIXED"];

function cleanString(value = "") {
  return String(value || "").trim();
}

function normaliseAccountType(value = "PERSONAL") {
  const clean = cleanString(value).toUpperCase();
  return ACCOUNT_TYPES.includes(clean) ? clean : "PERSONAL";
}

function isBusinessType(userType) {
  return ["ORG", "MIXED"].includes(normaliseAccountType(userType));
}

function getUserId(req) {
  return req.user?.id || req.user?.sub;
}

function getEndpointDetails(req, bodyEndpoint = {}) {
  const forwardedFor = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();

  return {
    ...(bodyEndpoint || {}),
    ipAddress: forwardedFor || req.headers["x-real-ip"] || req.ip || "",
    serverUserAgent: req.headers["user-agent"] || "",
    capturedAt: bodyEndpoint?.capturedAt || new Date().toISOString(),
  };
}

function mergeSocialState(existing = {}, incoming = {}) {

  const merged = {
    ...existing,
  };

  for (const [provider, value] of Object.entries(incoming)) {

    if (value === null) {
      delete merged[provider];
      continue;
    }

    merged[provider] = {
      ...(merged[provider] || {}),
      ...value,
    };

    if (Object.keys(merged[provider]).length === 0) {
      delete merged[provider];
    }

  }

  return merged;

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

function calculateProfileState(profile = {}) {
  const username = cleanString(profile.username);
  const displayName = cleanString(profile.display_name);
  const userType = normaliseAccountType(profile.user_type);

  if (!username || !displayName || !userType) {
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

  if (profile.business_verification_status === "verified") {
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
  }

  if (body.phone !== undefined) {
    data.phone = cleanString(body.phone);
  }

  if (body.phoneE164 !== undefined) {
    data.phone_e164 = cleanString(body.phoneE164);
  } else if (body.phone_e164 !== undefined) {
    data.phone_e164 = cleanString(body.phone_e164);
  }

  if (body.phoneDisplay !== undefined) {
    data.phone_display = cleanString(body.phoneDisplay);
  } else if (body.phone_display !== undefined) {
    data.phone_display = cleanString(body.phone_display);
  }

  if (body.phoneCountry !== undefined) {
    data.phone_country = cleanString(body.phoneCountry || "AU");
  } else if (body.phone_country !== undefined) {
    data.phone_country = cleanString(body.phone_country || "AU");
  }

  if (body.phoneVerified !== undefined) {
    data.phone_verified = Boolean(body.phoneVerified);
  } else if (body.phone_verified !== undefined) {
    data.phone_verified = Boolean(body.phone_verified);
  }

  if (body.homeLocation !== undefined) {
    data.home_location = body.homeLocation;
  } else if (body.home_location !== undefined) {
    data.home_location = body.home_location;
  }


  console.log(
  "INCOMING SOCIAL:",
  JSON.stringify(body.social, null, 2)
);

  if (body.social !== undefined) {
    data.social = body.social || {};
  }

  if (body.payment !== undefined) {
    data.payment = body.payment || {};
  }

  if (body.endpoint !== undefined) {
    data.endpoint = body.endpoint || {};
  }

  if (body.businessVerificationStatus !== undefined) {
    data.business_verification_status = cleanString(body.businessVerificationStatus);
  } else if (body.business_verification_status !== undefined) {
    data.business_verification_status = cleanString(body.business_verification_status);
  }

  return data;
}

function pickOrganisationFields(body = {}) {
  const org =
    body.organisationProfile ||
    body.organisation ||
    body.business ||
    null;

  if (!org) return null;

  const organisationName = cleanString(
    org.organisation_name ||
      org.organisationName ||
      org.name
  );

  if (!organisationName) return null;

  return {
    organisation_name: organisationName,
    trading_name: cleanString(org.trading_name || org.tradingName || org.name),
    organisation_email: cleanString(
      org.organisation_email ||
        org.organisationEmail ||
        org.email
    ),
    organisation_phone: cleanString(
      org.organisation_phone ||
        org.organisationPhone ||
        org.phone
    ),
    website: cleanString(org.website),
    location: org.location || null,
    email_verified: Boolean(org.email_verified || org.emailVerified),
    phone_verified: Boolean(org.phone_verified || org.phoneVerified),
    ownership_verified: Boolean(org.ownership_verified || org.ownershipVerified),
    business_level: org.business_level || org.businessLevel || 1,
    source: org.source || "manual",
  };
}

function applyAccountTypeRules(existing = {}, incoming = {}) {
  const next = {
    ...existing,
    ...incoming,
  };

  const requestedType = normaliseAccountType(
    incoming.user_type || existing.user_type || "PERSONAL"
  );

  if (requestedType === "PERSONAL") {
    next.user_type = "PERSONAL";
    next.pending_account_type = null;
    next.business_verification_status = "none";
    return next;
  }

  if (isBusinessType(requestedType)) {
    next.user_type = requestedType;
    next.pending_account_type = null;
    next.business_verification_status =
      incoming.business_verification_status ||
      existing.business_verification_status ||
      "draft";
    return next;
  }

  return next;
}

function normaliseOrganisationProfile(org) {
  if (!org) return null;

  return {
    id: org.id,
    userProfileId: org.user_profile_id,
    user_profile_id: org.user_profile_id,

    organisationName: org.organisation_name || "",
    organisation_name: org.organisation_name || "",

    tradingName: org.trading_name || "",
    trading_name: org.trading_name || "",

    organisationEmail: org.organisation_email || "",
    organisation_email: org.organisation_email || "",

    organisationPhone: org.organisation_phone || "",
    organisation_phone: org.organisation_phone || "",

    website: org.website || "",
    location: org.location || null,

    emailVerified: Boolean(org.email_verified),
    email_verified: Boolean(org.email_verified),

    phoneVerified: Boolean(org.phone_verified),
    phone_verified: Boolean(org.phone_verified),

    ownershipVerified: Boolean(org.ownership_verified),
    ownership_verified: Boolean(org.ownership_verified),

    businessLevel: org.business_level || 1,
    business_level: org.business_level || 1,

    source: org.source || "manual",

    createdAt: org.created_at,
    updatedAt: org.updated_at,
  };
}

function normaliseProfile(profile, organisationProfile = null) {
  if (!profile) return null;

  const accountType = isBusinessType(profile.user_type) ? "BUSINESS" : "PERSONAL";

  return {
    id: profile.id,
    userId: profile.user_id,
    username: profile.username || "",

    displayName: profile.display_name || "",
    display_name: profile.display_name || "",

    userType: profile.user_type || "PERSONAL",
    user_type: profile.user_type || "PERSONAL",

    accountType,
    account_type: accountType,

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

    businessVerificationStatus: profile.business_verification_status || "none",
    business_verification_status: profile.business_verification_status || "none",

    organisationProfile: normaliseOrganisationProfile(organisationProfile),
    organisation: normaliseOrganisationProfile(organisationProfile),

    version: profile.version || 1,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function fetchProfileByUserId(userId) {
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

async function fetchOrganisationByProfileId(userProfileId) {
  if (!userProfileId) return null;

  const result = await pool.query(
    `
      SELECT *
      FROM organisation_profiles
      WHERE user_profile_id = $1
      LIMIT 1
    `,
    [userProfileId]
  );

  return result.rows[0] || null;
}

async function saveOrganisationProfile({ userProfileId, organisation }) {
  if (!userProfileId || !organisation?.organisation_name) return null;

  const result = await pool.query(
    `
      INSERT INTO organisation_profiles (
        user_profile_id,
        organisation_name,
        trading_name,
        organisation_email,
        organisation_phone,
        website,
        location,
        email_verified,
        phone_verified,
        ownership_verified,
        business_level,
        source,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7::jsonb,
        $8,$9,$10,$11,$12,NOW()
      )
      ON CONFLICT (user_profile_id)
      DO UPDATE SET
        organisation_name = EXCLUDED.organisation_name,
        trading_name = EXCLUDED.trading_name,
        organisation_email = EXCLUDED.organisation_email,
        organisation_phone = EXCLUDED.organisation_phone,
        website = EXCLUDED.website,
        location = EXCLUDED.location,
        email_verified = EXCLUDED.email_verified,
        phone_verified = EXCLUDED.phone_verified,
        ownership_verified = EXCLUDED.ownership_verified,
        business_level = EXCLUDED.business_level,
        source = EXCLUDED.source,
        updated_at = NOW()
      RETURNING *
    `,
    [
      userProfileId,
      organisation.organisation_name,
      organisation.trading_name,
      organisation.organisation_email,
      organisation.organisation_phone,
      organisation.website,
      organisation.location ? JSON.stringify(organisation.location) : null,
      organisation.email_verified,
      organisation.phone_verified,
      organisation.ownership_verified,
      organisation.business_level,
      organisation.source,
    ]
  );

  return result.rows[0];
}

export async function saveProfile({ userId, incoming }) {
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

  const merged = {
    ...base,
    ...incoming,
    social: mergeSocialState(base.social || {}, incoming.social || {}),
    payment: mergePaymentState(base.payment || {}, incoming.payment || {}),
    endpoint: mergeEndpointState(base.endpoint || {}, incoming.endpoint || {}),
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
          $11::jsonb,$12::jsonb,$13::jsonb,
          $14,$15,$16,$17,$18,$19,$20
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
        finalProfile.home_location ? JSON.stringify(finalProfile.home_location) : null,
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
      finalProfile.home_location ? JSON.stringify(finalProfile.home_location) : null,
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

export async function getProfile(req, res) {
  try {
    const userId = getUserId(req);
    console.log("REQ.USER:", req.user);

    console.log("USER ID USED:", userId);
    

console.log("PATCH USER ID:", userId);
console.log("REQ.USER:", req.user);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const profile = await fetchProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const organisationProfile = await fetchOrganisationByProfileId(profile.id);

    return res.json({
      profile: normaliseProfile(profile, organisationProfile),
      organisationProfile: normaliseOrganisationProfile(organisationProfile),
      version: profile.version,
    });
  } catch (err) {
    console.error("GET PROFILE FAILED:", err);

    return res.status(500).json({
      error: "Profile load failed",
      detail: err.message,
    });
  }
}

export async function putProfile(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const incoming = pickProfileFields(req.body);
    incoming.endpoint = getEndpointDetails(req, req.body.endpoint);

    const organisation = pickOrganisationFields(req.body);

console.log(
    "==== FACEBOOK ABOUT TO SAVE ===="
);

console.log(
    JSON.stringify(incoming, null, 2)
);

    const saved = await saveProfile({ userId, incoming });

console.log(
    "==== FACEBOOK SAVED ===="
);

console.log(
    JSON.stringify(saved.social, null, 2)
);

    let savedOrganisation = null;

    if (isBusinessType(saved.user_type) && organisation) {
      savedOrganisation = await saveOrganisationProfile({
        userProfileId: saved.id,
        organisation,
      });
    } else {
      savedOrganisation = await fetchOrganisationByProfileId(saved.id);
    }

    return res.json({
      profile: normaliseProfile(saved, savedOrganisation),
      organisationProfile: normaliseOrganisationProfile(savedOrganisation),
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

export async function patchProfile(req, res) {
  try {
    const userId = getUserId(req);

 console.log("PATCH USER ID:", userId);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const existing = await fetchProfileByUserId(userId);

console.log("EXISTING PROFILE:", existing);

    if (!existing) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const incoming = pickProfileFields(req.body);
    incoming.endpoint = getEndpointDetails(req, req.body.endpoint);

    const organisation = pickOrganisationFields(req.body);

    const saved = await saveProfile({ userId, incoming });

    let savedOrganisation = null;

    if (isBusinessType(saved.user_type) && organisation) {
      savedOrganisation = await saveOrganisationProfile({
        userProfileId: saved.id,
        organisation,
      });
    } else {
      savedOrganisation = await fetchOrganisationByProfileId(saved.id);
    }

    return res.json({
      profile: normaliseProfile(saved, savedOrganisation),
      organisationProfile: normaliseOrganisationProfile(savedOrganisation),
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