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
    fetchProfileByUserId, saveProfile,
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

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const existing =
      await fetchProfileByUserId(userId);

    if (!existing) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    /* =====================================
       PROFILE
    ===================================== */

    const incoming =
      pickProfileFields(
        req.body.profile || {}
      );

    incoming.endpoint =
      getEndpointDetails(
        req,
        req.body.endpoint
      );

    /* =====================================
       ORGANISATION
    ===================================== */

    const organisation =
      pickOrganisationFields(
        req.body.organisationProfile || {}
      );

    /* =====================================
       SAVE PROFILE
    ===================================== */

    const saved =
      await saveProfile({
        userId,
        incoming,
      });

    /* =====================================
       SAVE ORGANISATION
    ===================================== */

    let savedOrganisation = null;

    if (
      isBusinessType(saved.userType) &&
      organisation
    ) {

      savedOrganisation =
        await saveOrganisationProfile({

          userProfileId:
            saved.id,

          organisation,

        });

    } else {

      savedOrganisation =
        await fetchOrganisationByProfileId(
          saved.id
        );

    }

    /* =====================================
       RESPONSE
    ===================================== */

    return res.json({

      profile: saved,

      organisationProfile:
        normaliseOrganisationProfile(
          savedOrganisation
        ),

      version:
        saved.version,

    });

  } catch (err) {

    console.error(
      "PATCH PROFILE FAILED:",
      err
    );

    return res.status(500).json({

      error:
        "Profile update failed",

      detail:
        err.message,

    });

  }
}