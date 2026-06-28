import { pool } from "../src/db/db.js";
import { profileToRow } from "../src/profile/profileToRow.js";
import { rowToProfile } from "../src/profile/rowToIdentity.js";

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

  const username =
    cleanString(profile.username);

  const displayName =
    cleanString(profile.displayName);

  const userType =
    normaliseAccountType(
      profile.userType
    );

  if (
    !username ||
    !displayName ||
    !userType
  ) {
    return {
      profileLevel: 0,
      profileStatus: "incomplete",
    };
  }

  if (userType === "PERSONAL") {
    return {
      profileLevel: 1,
      profileStatus: "basic_complete",
    };
  }

  if (
    profile.businessVerificationStatus ===
    "verified"
  ) {
    return {
      profileLevel: 3,
      profileStatus: "verified",
    };
  }

  return {
    profileLevel: 1,
    profileStatus: "business_pending",
  };

}

function pickProfileFields(body = {}) {

  const data = {};

  if (body.username !== undefined) {
    data.username = cleanString(body.username);
  }

  /* =====================================
     DISPLAY NAME
  ===================================== */

  if (body.displayName !== undefined) {

    data.displayName =
      cleanString(body.displayName);

  } else if (body.display_name !== undefined) {

    // Temporary compatibility during migration
    data.displayName =
      cleanString(body.display_name);

  }

  /* =====================================
     USER TYPE
  ===================================== */

  if (body.userType !== undefined) {

    data.userType =
      normaliseAccountType(body.userType);

  } else if (body.user_type !== undefined) {

    data.userType =
      normaliseAccountType(body.user_type);

  }

  /* =====================================
     PHONE
  ===================================== */

  if (body.phone !== undefined) {
    data.phone = cleanString(body.phone);
  }

  if (body.phoneE164 !== undefined) {

    data.phoneE164 =
      cleanString(body.phoneE164);

  } else if (body.phone_e164 !== undefined) {

    data.phoneE164 =
      cleanString(body.phone_e164);

  }

  if (body.phoneDisplay !== undefined) {

    data.phoneDisplay =
      cleanString(body.phoneDisplay);

  } else if (body.phone_display !== undefined) {

    data.phoneDisplay =
      cleanString(body.phone_display);

  }

  if (body.phoneCountry !== undefined) {

    data.phoneCountry =
      cleanString(body.phoneCountry || "AU");

  } else if (body.phone_country !== undefined) {

    data.phoneCountry =
      cleanString(body.phone_country || "AU");

  }

  if (body.phoneVerified !== undefined) {

    data.phoneVerified =
      Boolean(body.phoneVerified);

  } else if (body.phone_verified !== undefined) {

    data.phoneVerified =
      Boolean(body.phone_verified);

  }

  /* =====================================
     HOME
  ===================================== */

  if (body.homeLocation !== undefined) {

    data.homeLocation =
      body.homeLocation;

  } else if (body.home_location !== undefined) {

    data.homeLocation =
      body.home_location;

  }

  /* =====================================
     SOCIAL
  ===================================== */

  console.log(
    "INCOMING SOCIAL:",
    JSON.stringify(body.social, null, 2)
  );

  if (body.social !== undefined) {
    data.social = body.social || {};
  }

  /* =====================================
     PAYMENT
  ===================================== */

  if (body.payment !== undefined) {
    data.payment = body.payment || {};
  }

  /* =====================================
     ENDPOINT
  ===================================== */

  if (body.endpoint !== undefined) {
    data.endpoint = body.endpoint || {};
  }

  /* =====================================
     BUSINESS VERIFICATION
  ===================================== */

  if (body.businessVerificationStatus !== undefined) {

    data.businessVerificationStatus =
      cleanString(body.businessVerificationStatus);

  } else if (body.business_verification_status !== undefined) {

    data.businessVerificationStatus =
      cleanString(body.business_verification_status);

  }

  /* =====================================
     ORGANISATION
  ===================================== */

  if (body.organisation !== undefined) {

    data.organisation =
      body.organisation || {};

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

function applyAccountTypeRules(
  existing = {},
  incoming = {}
) {

  const next = {
    ...existing,
    ...incoming,
  };

  const requestedType =
    normaliseAccountType(

      incoming.userType ||

      existing.userType ||

      "PERSONAL"

    );

  if (requestedType === "PERSONAL") {

    next.userType = "PERSONAL";

    next.pendingAccountType = null;

    next.businessVerificationStatus = "none";

    return next;

  }

  if (isBusinessType(requestedType)) {

    next.userType = requestedType;

    next.pendingAccountType = null;

    next.businessVerificationStatus =

      incoming.businessVerificationStatus ||

      existing.businessVerificationStatus ||

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

  return rowToProfile(
    result.rows[0]
  );

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
  userId: userId,
  username: "",
  displayName: "",
  email: "",
  userType: "PERSONAL",

  phone: "",
  phoneE164: "",
  phoneDisplay: "",
  phoneCountry: "AU",
  phoneVerified: false,

  homeLocation: null,

  organisation: {},

  social: {},
  payment: {},
  endpoint: {},

  profileLevel: 0,
  profileStatus: "incomplete",
  pendingAccountType: null,
  businessVerificationStatus: "none",

  version: 0,

  createdAt: now,
};

const merged = {
  ...base,
  ...incoming,

  social: mergeSocialState(
    base.social || {},
    incoming.social || {}
  ),

  payment: mergePaymentState(
    base.payment || {},
    incoming.payment || {}
  ),

  endpoint: mergeEndpointState(
    base.endpoint || {},
    incoming.endpoint || {}
  ),

  organisation: {
    ...(base.organisation || {}),
    ...(incoming.organisation || {}),
  },

  version: (base.version || 0) + 1,

  updatedAt: now,
};
const accountResolved =
  applyAccountTypeRules(
    base,
    merged
  );


  const profileState = calculateProfileState(accountResolved);

  const finalProfile = {
    ...accountResolved,
    profile_level: profileState.profile_level,
    profile_status: profileState.profile_status,
    updated_at: now,
  };

  const row = profileToRow(finalProfile);

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
  row.user_id,
  row.username,
  row.display_name,
  row.user_type,
  row.phone,
  row.phone_e164,
  row.phone_display,
  row.phone_country,
  row.phone_verified,

  row.home_location
    ? JSON.stringify(row.home_location)
    : null,

  JSON.stringify(row.social),

  JSON.stringify(row.payment),

  JSON.stringify(row.endpoint),

  row.profile_level,

  row.profile_status,

  row.pending_account_type,

  row.business_verification_status,

  row.version,

  row.created_at,

  row.updated_at,
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
  row.username,
  row.display_name,
  row.user_type,
  row.phone,
  row.phone_e164,
  row.phone_display,
  row.phone_country,
  row.phone_verified,

  row.home_location
    ? JSON.stringify(row.home_location)
    : null,

  JSON.stringify(row.social),

  JSON.stringify(row.payment),

  JSON.stringify(row.endpoint),

  row.profile_level,

  row.profile_status,

  row.pending_account_type,

  row.business_verification_status,

  row.version,

  row.updated_at,

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