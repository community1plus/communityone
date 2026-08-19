import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   HELPERS
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

function mergeSocialState(
  existing = {},
  incoming = {}
) {

  const merged = {
    ...existing,
  };

  for (
    const [provider, value]
    of Object.entries(incoming)
  ) {

    if (value === null) {

      delete merged[provider];

      continue;
    }

    merged[provider] = {

      ...(merged[provider] || {}),

      ...(value || {}),

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
      base.userType
    );

  const requestedType =
    merged.userType
      ? normaliseAccountType(
          merged.userType
        )
      : currentType;


  /*
   * Personal accounts can immediately
   * remain PERSONAL.
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
   * Business / organisation accounts
   * enter the verification workflow.
   */

  if (
    requestedType === "BUSINESS" ||
    requestedType === "ORGANISATION"
  ) {

    result.userType =
      requestedType;

    /*
     * Do not automatically mark a
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


  if (
    userType === "PERSONAL"
  ) {

    return {

      profileLevel: 1,

      profileStatus:
        "basic_complete",

    };

  }


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


  return {

    profileLevel: 1,

    profileStatus:
      "business_pending",

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
   SAVE PROFILE
===================================================== */

async function persistProfile(
  userId,
  incoming
) {

  const existing =
    await fetchProfileByUserId(
      userId
    );


  /*
   * Existing profile
   */

  if (existing) {

    const merged = {

      ...existing,

      ...incoming,

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
          incoming.endpoint
        ),

      organisation: {

        ...(existing.organisation || {}),

        ...(incoming.organisation || {}),

      },

    };


    const accountResolved =
      applyAccountTypeRules(
        existing,
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

      version:
        (existing.version || 0) + 1,

      updatedAt:
        new Date(),

    };


    return updateProfile(
      finalProfile
    );

  }


  /*
   * No profile yet.
   */

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
      new Date(),

    updatedAt:
      new Date(),

  };


  const merged = {

    ...base,

    ...incoming,

    social:
      mergeSocialState(
        base.social,
        incoming.social
      ),

    payment:
      mergePaymentState(
        base.payment,
        incoming.payment
      ),

    endpoint:
      mergeEndpointState(
        base.endpoint,
        incoming.endpoint
      ),

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

  const profile =
    await fetchProfileByUserId(
      userId
    );


  if (!profile) {

    return {

      profile: null,

      hasProfile: false,

    };

  }


  return {

    profile,

    hasProfile: true,

    version:
      profile.version,

  };

}


/* =====================================================
   PUT PROFILE
===================================================== */

export async function putProfileService({
  userId,
  body,
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
    buildIncomingProfile(
      body
    );


  /*
   * Endpoint information is generated
   * server-side rather than trusted from
   * the browser.
   */

  if (req) {

    incoming.endpoint = {

      ...(incoming.endpoint || {}),

      ip:
        req.ip ||
        null,

      userAgent:
        req.headers[
          "user-agent"
        ] || null,

    };

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