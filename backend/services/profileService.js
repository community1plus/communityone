import {
  fetchProfileByUserId,
  saveProfile,
} from "../repositories/profileRepository.js";

import {
  fetchOrganisationByProfileId,
  saveOrganisationProfile,
} from "../repositories/organisationRepository.js";

import {
  pickProfileFields,
  pickOrganisationFields,
} from "../controllers/profileControllerHelpers.js";

import {
  getEndpointDetails,
} from "../utils/endpoint.js";

import {
  isBusinessType,
} from "../utils/profileRules.js";

/* =========================================
   PATCH PROFILE
========================================= */
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