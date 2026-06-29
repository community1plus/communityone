import { pool } from "../src/db/db.js";
import { profileToRow } from "../src/profile/profileToRow.js";
import { rowToProfile } from "../src/profile/rowToProfile.js";
import {
    cleanString,
    normaliseAccountType,
    getUserId,
    isBusinessType,
    pickProfileFields,
    pickOrganisationFields,
} from "../helpers/profileHelpers.js";
import {
    fetchProfileByUserId,
} from "../repositories/profileRepository.js";

const TABLE = "user_profiles";




function getEndpointDetails(req, bodyEndpoint = {}) {
  const forwardedFor = req.headers["x-forwarded-for"]?.split(",")[0]?.trim();

  return {
    ...(bodyEndpoint || {}),
    ipAddress: forwardedFor || req.headers["x-real-ip"] || req.ip || "",
    serverUserAgent: req.headers["user-agent"] || "",
    capturedAt: bodyEndpoint?.capturedAt || new Date().toISOString(),
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
console.log("REQ.USER:", JSON.stringify(req.user, null, 2));
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

console.log(
  "PATCH BODY:",
  JSON.stringify(req.body, null, 2)
);

console.log(
  "INCOMING:",
  JSON.stringify(incoming, null, 2)
);

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
    console.log(
  JSON.stringify(req.body, null, 2)
);
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
  console.log(
  "REQ BODY",
  JSON.stringify(req.body, null, 2)
);

console.log(
  "REQ BODY PROFILE",
  JSON.stringify(req.body.profile, null, 2)
);
    const incoming = pickProfileFields(req.body);
    console.log(
  "INCOMING PROFILE",
  JSON.stringify(incoming, null, 2)
);
    incoming.endpoint = getEndpointDetails(req, req.body.endpoint);

    const organisation = pickOrganisationFields(req.body);

    const saved = await saveProfile({ userId, incoming });

let savedOrganisation = null;

if (
  isBusinessType(saved.userType) &&
  organisation
) {

  savedOrganisation =
    await saveOrganisationProfile({

      userProfileId: saved.id,

      organisation,

    });

} else {

  savedOrganisation =
    await fetchOrganisationByProfileId(
      saved.id
    );

}

return res.json({

  profile: saved,

  organisationProfile:
    normaliseOrganisationProfile(
      savedOrganisation
    ),

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