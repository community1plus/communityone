import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   CONSTANTS
===================================================== */

const DEFAULT_PHONE_COUNTRY = "AU";
const DEFAULT_USER_TYPE = "PERSONAL";
const DEFAULT_PROFILE_STATUS = "incomplete";
const DEFAULT_BUSINESS_VERIFICATION_STATUS = "none";


/* =====================================================
   STRING HELPERS
===================================================== */

function cleanString(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}


/* =====================================================
   ACCOUNT TYPE
===================================================== */

function normaliseAccountType(value) {

  const type =
    cleanString(value).toUpperCase();


  if (
    type === "PERSONAL" ||
    type === "PERSON"
  ) {
    return "PERSONAL";
  }


  /*
   * ORG is retained as a supported
   * application-level value.
   *
   * BUSINESS / ORGANISATION / ORGANIZATION
   * are normalised to BUSINESS.
   */

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


  return (
    type ||
    DEFAULT_USER_TYPE
  );
}


/* =====================================================
   ACCOUNT TYPE HELPERS
===================================================== */

function isBusinessType(value) {

  const type =
    normaliseAccountType(value);

  return (
    type === "BUSINESS" ||
    type === "ORG"
  );
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
    of Object.entries(
      incoming || {}
    )
  ) {

    /*
     * null explicitly removes
     * the provider.
     */

    if (value === null) {
      delete merged[provider];
      continue;
    }


    /*
     * Ignore malformed values.
     */

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


    /*
     * Remove empty provider objects.
     */

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
    cleanString(
      profile.username
    );


  const displayName =
    cleanString(
      profile.displayName
    );


  const userType =
    normaliseAccountType(
      profile.userType
    );


  /*
   * Minimum profile requirements.
   */

  if (
    !username ||
    !displayName
  ) {

    return {

      profileLevel: 0,

      profileStatus:
        DEFAULT_PROFILE_STATUS,

    };
  }


  /*
   * Personal account.
   */

  if (
    userType === "PERSONAL"
  ) {

    return {

      profileLevel: 1,

      profileStatus:
        "basic_complete",

    };
  }


  /*
   * Business / organisation.
   */

  if (
    isBusinessType(userType) &&
    profile.businessVerificationStatus ===
      "verified"
  ) {

    return {

      profileLevel: 3,

      profileStatus:
        "verified",

    };
  }


  /*
   * Business account awaiting
   * verification.
   */

  if (
    isBusinessType(userType)
  ) {

    return {

      profileLevel: 1,

      profileStatus:
        "business_pending",

    };
  }


  /*
   * Unknown account type.
   */

  return {

    profileLevel: 0,

    profileStatus:
      DEFAULT_PROFILE_STATUS,

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


  if (
    profile.userType !== undefined
  ) {
    incoming.userType =
      normaliseAccountType(
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
      Boolean(
        profile.phoneVerified
      );
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
    profile.endpoint !== undefined
  ) {
    incoming.endpoint =
      profile.endpoint;
  }


  if (
    profile.pendingAccountType !== undefined
  ) {
    incoming.pendingAccountType =
      profile.pendingAccountType;
  }


  if (
    profile.businessVerificationStatus !==
    undefined
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
      incoming?.ip ||
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

    userType:
      DEFAULT_USER_TYPE,

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

  const merged = {

    ...existing,

    ...incoming,

    userType:
      normaliseAccountType(
        incoming.userType ??
        existing.userType
      ),


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
   * Never allow the client to
   * accidentally erase the user ID.
   */

  merged.userId =
    existing.userId;


  /*
   * Recalculate profile state
   * server-side.
   */

  const state =
    calculateProfileState(
      merged
    );


  merged.profileLevel =
    state.profileLevel;


  merged.profileStatus =
    state.profileStatus;


  /*
   * Version is controlled by the
   * service, not the client.
   */

  merged.version =
    Number(
      existing.version || 0
    ) + 1;


  merged.updatedAt =
    new Date();


  return merged;
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


  /*
   * Endpoint information is
   * server-controlled.
   */

  incoming.endpoint =
    getEndpointDetails(
      req,
      incoming.endpoint
    );


  /*
   * CREATE
   */

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

      version:
        saved.version,

    };
  }


  /*
   * UPDATE
   */

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

    version:
      saved.version,

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


  /*
   * Endpoint is generated from
   * the authenticated request.
   */

  incoming.endpoint =
    getEndpointDetails(
      req,
      incoming.endpoint
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