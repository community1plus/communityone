import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   HELPERS
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


function normaliseAccountType(value) {

  const type =
    cleanString(value).toUpperCase();

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

  return type || "PERSONAL";
}


function isBusinessType(value) {

  return (
    normaliseAccountType(value) ===
    "BUSINESS"
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
    ...existing,
  };

  for (
    const [provider, value]
    of Object.entries(incoming || {})
  ) {

    if (value === null) {
      delete merged[provider];
      continue;
    }

    merged[provider] = {
      ...(merged[provider] || {}),
      ...value,
    };
  }

  return merged;
}


function mergePaymentState(
  existing = {},
  incoming = {}
) {

  return {
    ...existing,
    ...incoming,
  };
}


function mergeEndpointState(
  existing = {},
  incoming = {}
) {

  return {
    ...existing,
    ...incoming,
  };
}


/* =====================================================
   PROFILE STATE
===================================================== */

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
    !displayName
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


/* =====================================================
   PROFILE FIELD PICKER
===================================================== */

function pickProfileFields(profile = {}) {

  return {

    ...(profile.username !== undefined && {
      username: cleanString(profile.username),
    }),

    ...(profile.displayName !== undefined && {
      displayName: cleanString(profile.displayName),
    }),

    ...(profile.userType !== undefined && {
      userType:
        normaliseAccountType(profile.userType),
    }),

    ...(profile.phone !== undefined && {
      phone: profile.phone,
    }),

    ...(profile.phoneE164 !== undefined && {
      phoneE164: profile.phoneE164,
    }),

    ...(profile.phoneDisplay !== undefined && {
      phoneDisplay: profile.phoneDisplay,
    }),

    ...(profile.phoneCountry !== undefined && {
      phoneCountry: profile.phoneCountry,
    }),

    ...(profile.phoneVerified !== undefined && {
      phoneVerified: profile.phoneVerified,
    }),

    ...(profile.homeLocation !== undefined && {
      homeLocation: profile.homeLocation,
    }),

    ...(profile.social !== undefined && {
      social: profile.social,
    }),

    ...(profile.payment !== undefined && {
      payment: profile.payment,
    }),

    ...(profile.endpoint !== undefined && {
      endpoint: profile.endpoint,
    }),

    ...(profile.pendingAccountType !== undefined && {
      pendingAccountType:
        profile.pendingAccountType,
    }),

    ...(profile.businessVerificationStatus !== undefined && {
      businessVerificationStatus:
        profile.businessVerificationStatus,
    }),
  };
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
      req.ip ||
      incoming?.ip ||
      null,
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

  const existing =
    await fetchProfileByUserId(
      userId
    );


  const incoming =
    pickProfileFields(
      body?.profile || {}
    );


  if (!existing) {

    const profile =
      buildMergedProfile(
        {
          userId,
          username: "",
          displayName: "",
          userType: "PERSONAL",
          phone: "",
          phoneE164: "",
          phoneDisplay: "",
          phoneCountry: "AU",
          phoneVerified: false,
          homeLocation: null,
          social: {},
          payment: {},
          endpoint: {},
          profileLevel: 0,
          profileStatus: "incomplete",
          pendingAccountType: null,
          businessVerificationStatus: "none",
          version: 0,
          createdAt: new Date(),
        },
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
    "[PROFILE SERVICE] MERGED PROFILE:",
    JSON.stringify(
      merged,
      null,
      2
    )
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