import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   STRING / ACCOUNT HELPERS
===================================================== */

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function normaliseAccountType(value) {

  const type =
    cleanString(value).toUpperCase();

  if (
    type === "PERSONAL" ||
    type === "BUSINESS" ||
    type === "ORGANISATION"
  ) {
    return type;
  }

  return "PERSONAL";
}


function isBusinessType(value) {

  const type =
    normaliseAccountType(value);

  return (
    type === "BUSINESS" ||
    type === "ORGANISATION"
  );
}


/* =====================================================
   STATE MERGERS
===================================================== */

/*
 * Social state is provider based:
 *
 * {
 *   facebook: {...},
 *   google: {...}
 * }
 *
 * null means remove the provider.
 */

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

    /*
     * Explicit null removes
     * the provider.
     */
    if (value === null) {

      delete merged[provider];

      continue;
    }

    /*
     * Merge provider state rather
     * than replacing the entire
     * provider object.
     */
    merged[provider] = {
      ...(merged[provider] || {}),
      ...(value || {}),
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
   PROFILE FIELD FILTER
===================================================== */

function pickProfileFields(
  profile = {}
) {

  const allowed = [

    "username",
    "displayName",
    "email",

    "userType",

    "phone",
    "phoneE164",
    "phoneDisplay",
    "phoneCountry",
    "phoneVerified",

    "homeLocation",

    "social",
    "payment",
    "endpoint",

    "profileLevel",
    "profileStatus",

    "pendingAccountType",
    "businessVerificationStatus",

  ];

  const result = {};

  for (const field of allowed) {

    if (
      Object.prototype.hasOwnProperty.call(
        profile,
        field
      )
    ) {

      result[field] =
        profile[field];

    }

  }

  return result;
}


/* =====================================================
   ACCOUNT TYPE RULES
===================================================== */

function applyAccountTypeRules(
  base,
  merged
) {

  const result = {
    ...merged,
  };

  const currentType =
    normaliseAccountType(
      base?.userType
    );

  const requestedType =
    merged?.userType
      ? normaliseAccountType(
          merged.userType
        )
      : currentType;


  /*
   * PERSONAL
   */

  if (
    requestedType === "PERSONAL"
  ) {

    result.userType =
      "PERSONAL";

    result.pendingAccountType =
      null;

    return result;
  }


  /*
   * BUSINESS / ORGANISATION
   *
   * These enter the verification
   * workflow.
   */

  if (
    requestedType === "BUSINESS" ||
    requestedType === "ORGANISATION"
  ) {

    result.userType =
      requestedType;

    /*
     * Never automatically mark a
     * business as verified.
     */
    if (
      result.businessVerificationStatus !==
      "verified"
    ) {

      result.businessVerificationStatus =
        result.businessVerificationStatus ||
        "none";

    }

    return result;
  }


  /*
   * Fallback.
   */

  result.userType =
    currentType;

  return result;
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
   * Basic profile incomplete.
   */

  if (
    !username ||
    !displayName
  ) {

    return {

      profileLevel: 0,

      profileStatus:
        "incomplete",

    };

  }


  /*
   * PERSONAL accounts.
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
   * BUSINESS / ORGANISATION
   * verified.
   */

  if (
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
   * BUSINESS / ORGANISATION
   * awaiting verification.
   */

  return {

    profileLevel: 1,

    profileStatus:
      "business_pending",

  };

}


/* =====================================================
   ENDPOINT DETAILS
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

    userAgent:
      req?.headers?.["user-agent"] ||
      null,

    updatedAt:
      new Date().toISOString(),

  };

}


/* =====================================================
   BUILD INCOMING PROFILE
===================================================== */

function buildIncomingProfile(
  body = {}
) {

  return pickProfileFields(
    body.profile || {}
  );

}


/* =====================================================
   PERSIST PROFILE
===================================================== */

async function persistProfile(
  userId,
  incoming = {}
) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  const existing =
    await fetchProfileByUserId(
      userId
    );


  /* ===================================================
     EXISTING PROFILE
  =================================================== */

  if (existing) {

    const merged = {

      ...existing,

      ...incoming,

      social:
        mergeSocialState(
          existing.social || {},
          incoming.social || {}
        ),

      payment:
        mergePaymentState(
          existing.payment || {},
          incoming.payment || {}
        ),

      endpoint:
        mergeEndpointState(
          existing.endpoint || {},
          incoming.endpoint || {}
        ),

      organisation: {
        ...(existing.organisation || {}),
        ...(incoming.organisation || {}),
      },

    };


    /*
     * Apply account rules.
     */

    const accountResolved =
      applyAccountTypeRules(
        existing,
        merged
      );


    /*
     * Calculate derived profile
     * state.
     */

    const profileState =
      calculateProfileState(
        accountResolved
      );


    /*
     * Final profile.
     */

    const finalProfile = {

      ...accountResolved,

      profileLevel:
        profileState.profileLevel,

      profileStatus:
        profileState.profileStatus,

      version:
        (existing.version || 0) + 1,

      updatedAt:
        new Date(),

    };


    return updateProfile(
      finalProfile
    );

  }


  /* ===================================================
     NEW PROFILE
  =================================================== */

  const now =
    new Date();


  const base = {

    userId,

    username:
      "",

    displayName:
      "",

    email:
      "",

    userType:
      "PERSONAL",

    phone:
      "",

    phoneE164:
      "",

    phoneDisplay:
      "",

    phoneCountry:
      "AU",

    phoneVerified:
      false,

    homeLocation:
      null,

    social:
      {},

    payment:
      {},

    endpoint:
      {},

    profileLevel:
      0,

    profileStatus:
      "incomplete",

    pendingAccountType:
      null,

    businessVerificationStatus:
      "none",

    version:
      1,

    createdAt:
      now,

    updatedAt:
      now,

  };


  const merged = {

    ...base,

    ...incoming,

    social:
      mergeSocialState(
        base.social,
        incoming.social || {}
      ),

    payment:
      mergePaymentState(
        base.payment,
        incoming.payment || {}
      ),

    endpoint:
      mergeEndpointState(
        base.endpoint,
        incoming.endpoint || {}
      ),

    organisation: {
      ...(base.organisation || {}),
      ...(incoming.organisation || {}),
    },

  };


  const accountResolved =
    applyAccountTypeRules(
      base,
      merged
    );


  const profileState =
    calculateProfileState(
      accountResolved
    );


  const finalProfile = {

    ...accountResolved,

    profileLevel:
      profileState.profileLevel,

    profileStatus:
      profileState.profileStatus,

    createdAt:
      now,

    updatedAt:
      now,

  };


  return createProfile(
    finalProfile
  );

}


/* =====================================================
   GET PROFILE
===================================================== */

export async function getProfileService({
  userId,
}) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  const profile =
    await fetchProfileByUserId(
      userId
    );


  if (!profile) {

    return {

      profile:
        null,

      hasProfile:
        false,

    };

  }


  return {

    profile,

    hasProfile:
      true,

    version:
      profile.version,

  };

}


/* =====================================================
   PUT PROFILE
===================================================== */

export async function putProfileService({
  userId,
  body = {},
}) {

  const incoming =
    buildIncomingProfile(
      body
    );


  const saved =
    await persistProfile(
      userId,
      incoming
    );


  return {

    profile:
      saved,

    version:
      saved.version,

  };

}


/* =====================================================
   PATCH PROFILE
===================================================== */

export async function patchProfileService({
  userId,
  body = {},
  req,
}) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  /*
   * PATCH requires an existing
   * Community One profile.
   */

  const existing =
    await fetchProfileByUserId(
      userId
    );


  if (!existing) {

    throw new Error(
      "Profile not found"
    );

  }


  /*
   * Only permitted profile fields
   * are accepted.
   */

  const incoming =
    buildIncomingProfile(
      body
    );


  /*
   * Endpoint data is server-side.
   */

  if (req) {

    incoming.endpoint =
      getEndpointDetails(
        req,
        incoming.endpoint || {}
      );

  }


  const saved =
    await persistProfile(
      userId,
      incoming
    );


  return {

    profile:
      saved,

    organisationProfile:
      null,

    version:
      saved.version,

  };

}


/* =====================================================
   FACEBOOK VERIFICATION
===================================================== */

export async function updateFacebookProfile({
  userId,
  facebook,
}) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  if (!facebook) {

    throw new Error(
      "Missing Facebook profile"
    );

  }


  const incoming = {

    social: {

      facebook,

    },

  };


  const saved =
    await persistProfile(
      userId,
      incoming
    );


  return {

    profile:
      saved,

    version:
      saved.version,

  };

}


/* =====================================================
   FACEBOOK DISCONNECT
===================================================== */

export async function disconnectFacebook({
  userId,
}) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
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


  /*
   * null tells mergeSocialState()
   * to remove the Facebook provider.
   */

  const incoming = {

    social: {

      facebook:
        null,

    },

  };


  const saved =
    await persistProfile(
      userId,
      incoming
    );


  return {

    profile:
      saved,

    version:
      saved.version,

  };

}