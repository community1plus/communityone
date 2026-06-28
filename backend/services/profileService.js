import { fetchProfileByUserId, saveProfile, } from "../repositories/profileRepository.js";
import { fetchOrganisationByProfileId, saveOrganisationProfile, } from "../repositories/organisationRepository.js";
import { pickProfileFields, pickOrganisationFields, } from "../controllers/profileControllerHelpers.js";
import { getEndpointDetails, } from "../utils/endpoint.js";
import {  isBusinessType, } from "../utils/profileRules.js";

/* =========================================
   PATCH PROFILE
========================================= */
export function mergeSocialState(existing = {}, incoming = {}) {

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

export function mergePaymentState(existing = {}, incoming = {}) {
  return {
    ...existing,
    ...incoming,
  };
}

export function mergeEndpointState(existing = {}, incoming = {}) {
  return {
    ...existing,
    ...incoming,
  };
}

export function calculateProfileState(profile = {}) {

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

export async function patchProfileService({
  userId,
  body,
  req,
}) {

  const existing =
    await fetchProfileByUserId(userId);

  if (!existing) {
    throw new Error("Profile not found");
  }

  const incoming =
    pickProfileFields(body.profile || {});

  incoming.endpoint =
    getEndpointDetails(
      req,
      body.endpoint
    );

  const organisation =
    pickOrganisationFields(
      body.organisationProfile || {}
    );

  const saved =
    await saveProfile({
      userId,
      incoming,
    });

  let savedOrganisation = null;

  if (
    isBusinessType(saved.userType)
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

  return {

    profile: saved,

    organisationProfile:
      savedOrganisation,

    version:
      saved.version,

  };

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