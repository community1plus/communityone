import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULT_PHONE_COUNTRY = "AU";
const DEFAULT_MODE = "PERSON";
const DEFAULT_PROFILE_STATUS = "incomplete";
const DEFAULT_BUSINESS_VERIFICATION_STATUS = "none";


/* =====================================================
   STRING HELPERS
===================================================== */

function cleanString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}


/* =====================================================
   MODE
===================================================== */

function normaliseMode(value) {
  const type = cleanString(value).toUpperCase();

  if (
    type === "PERSON" ||
    type === "PERSONAL"
  ) {
    return "PERSON";
  }

  if (
    type === "ENTITY" ||
    type === "BUSINESS" ||
    type === "ORGANISATION" ||
    type === "ORGANIZATION" ||
    type === "ORG"
  ) {
    return "ENTITY";
  }

  return type || DEFAULT_MODE;
}


/* =====================================================
   LEGACY ACCOUNT TYPE
===================================================== */

function normaliseAccountType(value) {
  const type = cleanString(value).toUpperCase();

  if (
    type === "PERSONAL" ||
    type === "PERSON"
  ) {
    return "PERSONAL";
  }

  if (
    type === "BUSINESS" ||
    type === "ORGANISATION" ||
    type === "ORGANIZATION"
  ) {
    return "BUSINESS";
  }

  if (type === "ORG") {
    return "ORG";
  }

  return type || "PERSONAL";
}


function isEntityMode(value) {
  return normaliseMode(value) === "ENTITY";
}


/* =====================================================
   STATE MERGERS
===================================================== */

function mergeSocialState(
  existing = {},
  incoming = {}
) {
  const merged = {
    ...(existing || {}),
  };

  for (
    const [provider, value]
    of Object.entries(incoming || {})
  ) {

    if (value === null) {
      delete merged[provider];
      continue;
    }

    if (
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      continue;
    }

    merged[provider] = {
      ...(merged[provider] || {}),
      ...value,
    };

    if (
      Object.keys(
        merged[provider]
      ).length === 0
    ) {
      delete merged[provider];
    }
  }

  return merged;
}


function mergePaymentState(
  existing = {},
  incoming = {}
) {
  return {
    ...(existing || {}),
    ...(incoming || {}),
  };
}


function mergeEndpointState(
  existing = {},
  incoming = {}
) {
  return {
    ...(existing || {}),
    ...(incoming || {}),
  };
}


/* =====================================================
   PROFILE STATE
===================================================== */

function calculateProfileState(
  profile = {}
) {
  const username =
    cleanString(profile.username);

  const displayName =
    cleanString(profile.displayName);

  const mode =
    normaliseMode(
      profile.mode ??
      profile.userType
    );

  if (
    !username ||
    !displayName
  ) {
    return {
      profileLevel: 0,
      profileStatus: "incomplete",
    };
  }

  if (mode === "PERSON") {
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
    profileStatus: "entity_pending",
  };
}


/* =====================================================
   PROFILE FIELD PICKER
===================================================== */

function pickProfileFields(
  profile = {}
) {

  const incoming = {};

  if (
    profile.username !== undefined
  ) {
    incoming.username =
      cleanString(
        profile.username
      );
  }

  if (
    profile.displayName !== undefined
  ) {
    incoming.displayName =
      cleanString(
        profile.displayName
      );
  }

  /*
   * Mode is canonical.
   *
   * userType is accepted temporarily
   * for frontend compatibility.
   */

  if (
    profile.mode !== undefined
  ) {
    incoming.mode =
      normaliseMode(
        profile.mode
      );
  }
  else if (
    profile.userType !== undefined
  ) {
    incoming.mode =
      normaliseMode(
        profile.userType
      );
  }

  if (
    profile.phone !== undefined
  ) {
    incoming.phone =
      profile.phone;
  }

  if (
    profile.phoneE164 !== undefined
  ) {
    incoming.phoneE164 =
      profile.phoneE164;
  }

  if (
    profile.phoneDisplay !== undefined
  ) {
    incoming.phoneDisplay =
      profile.phoneDisplay;
  }

  if (
    profile.phoneCountry !== undefined
  ) {
    incoming.phoneCountry =
      profile.phoneCountry;
  }

  if (
    profile.phoneVerified !== undefined
  ) {
    incoming.phoneVerified =
      profile.phoneVerified;
  }

  if (
    profile.homeLocation !== undefined
  ) {
    incoming.homeLocation =
      profile.homeLocation;
  }

  if (
    profile.social !== undefined
  ) {
    incoming.social =
      profile.social;
  }

  if (
    profile.payment !== undefined
  ) {
    incoming.payment =
      profile.payment;
  }

  if (
    profile.pendingAccountType !== undefined
  ) {
    incoming.pendingAccountType =
      profile.pendingAccountType;
  }

  if (
    profile.businessVerificationStatus !== undefined
  ) {
    incoming.businessVerificationStatus =
      profile.businessVerificationStatus;
  }

  return incoming;
}


/* =====================================================
   ENDPOINT
===================================================== */

function getEndpointDetails(
  req,
  incoming = {}
) {
  return {
    ...(incoming || {}),

    ip:
      req?.ip ||
      null,
  };
}


/* =====================================================
   DEFAULT PROFILE
===================================================== */

function createDefaultProfile(
  userId
) {
  const now =
    new Date();

  return {

    userId,

    username: "",

    displayName: "",

    email: "",

    mode:
      DEFAULT_MODE,

    /*
     * Legacy compatibility.
     *
     * Repository/mapping can continue
     * supporting userType while migration
     * completes.
     */
    userType: "PERSONAL",

    phone: "",

    phoneE164: "",

    phoneDisplay: "",

    phoneCountry:
      DEFAULT_PHONE_COUNTRY,

    phoneVerified: false,

    homeLocation: null,

    social: {},

    payment: {},

    endpoint: {},

    profileLevel: 0,

    profileStatus:
      DEFAULT_PROFILE_STATUS,

    pendingAccountType: null,

    businessVerificationStatus:
      DEFAULT_BUSINESS_VERIFICATION_STATUS,

    version: 0,

    createdAt: now,

    updatedAt: now,
  };
}


/* =====================================================
   BUILD MERGED PROFILE
===================================================== */

function buildMergedProfile(
  existing,
  incoming,
  req
) {

  const mode =
    normaliseMode(
      incoming.mode ??
      existing.mode ??
      existing.userType
    );

  const merged = {

    ...existing,

    ...incoming,

    mode,

    social:
      mergeSocialState(
        existing.social,
        incoming.social
      ),

    payment:
      mergePaymentState(
        existing.payment,
        incoming.payment
      ),

    endpoint:
      mergeEndpointState(
        existing.endpoint,
        getEndpointDetails(
          req,
          incoming.endpoint
        )
      ),
  };


  /*
   * Preserve legacy database field
   * while the Mode migration completes.
   */

  merged.userType =
    mode === "PERSON"
      ? "PERSONAL"
      : "ORG";


  const state =
    calculateProfileState(
      merged
    );


  return {

    ...merged,

    profileLevel:
      state.profileLevel,

    profileStatus:
      state.profileStatus,

    version:
      (existing.version || 0) + 1,

    updatedAt:
      new Date(),
  };
}


/* =====================================================
   GET PROFILE
===================================================== */

export async function getProfileService({
  userId,
}) {

  if (!userId) {
    throw new Error(
      "Missing userId"
    );
  }

  const profile =
    await fetchProfileByUserId(
      userId
    );

  return {
    profile,

    hasProfile:
      !!profile,

    version:
      profile?.version ?? 0,
  };
}


/* =====================================================
   PUT PROFILE
===================================================== */

export async function putProfileService({
  userId,
  body,
  req,
}) {

  if (!userId) {
    throw new Error(
      "Missing userId"
    );
  }

  const existing =
    await fetchProfileByUserId(
      userId
    );

  const incoming =
    pickProfileFields(
      body?.profile || {}
    );


  if (!existing) {

    const base =
      createDefaultProfile(
        userId
      );

    const profile =
      buildMergedProfile(
        base,
        incoming,
        req
      );

    const saved =
      await createProfile(
        profile
      );

    return {
      profile: saved,
      version: saved.version,
    };
  }


  const merged =
    buildMergedProfile(
      existing,
      incoming,
      req
    );

  const saved =
    await updateProfile(
      merged
    );

  return {
    profile: saved,
    version: saved.version,
  };
}


/* =====================================================
   PATCH PROFILE
===================================================== */

export async function patchProfileService({
  userId,
  body,
  req,
}) {

  if (!userId) {
    throw new Error(
      "Missing userId"
    );
  }

  const existing =
    await fetchProfileByUserId(
      userId
    );

  if (!existing) {
    throw new Error(
      "Profile not found"
    );
  }

  const incoming =
    pickProfileFields(
      body?.profile || {}
    );

  const merged =
    buildMergedProfile(
      existing,
      incoming,
      req
    );


  console.log(
    "[PROFILE SERVICE] PATCH",
    {
      userId,

      existingUserId:
        existing.userId,

      mergedUserId:
        merged.userId,

      existingVersion:
        existing.version,

      nextVersion:
        merged.version,

      mode:
        merged.mode,

      userType:
        merged.userType,
    }
  );


  const saved =
    await updateProfile(
      merged
    );


  return {
    profile: saved,

    organisationProfile:
      null,

    version:
      saved.version,
  };
}