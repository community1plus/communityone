import {
  fetchProfileByUserId,
  createProfile,
  updateProfile,
} from "../repositories/profileRepository.js";


/* =====================================================
   NORMALISATION
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

  return null;
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
   PROFILE FIELD FILTER
===================================================== */

function pickProfileFields(profile = {}) {

  const allowed = [
    "username",
    "displayName",
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

    if (
      typeof value === "object" &&
      !Array.isArray(value)
    ) {

      merged[provider] = {
        ...(merged[provider] || {}),
        ...value,
      };

    } else {

      merged[provider] = value;

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
   ACCOUNT TYPE RULES
===================================================== */

function applyAccountTypeRules(
  existing = {},
  incoming = {}
) {

  const result = {
    ...existing,
    ...incoming,
  };

  const requestedType =
    normaliseAccountType(
      incoming.userType
    );

  const existingType =
    normaliseAccountType(
      existing.userType
    );


  /*
   * No account type supplied.
   *
   * Preserve the existing type.
   */

  if (!requestedType) {

    result.userType =
      existingType ||
      "PERSONAL";

    return result;
  }


  /*
   * Personal account.
   */

  if (
    requestedType === "PERSONAL"
  ) {

    result.userType =
      "PERSONAL";

    result.pendingAccountType =
      null;

    /*
     * Personal accounts do not
     * require business verification.
     */

    if (
      !result.businessVerificationStatus
    ) {
      result.businessVerificationStatus =
        "none";
    }

    return result;
  }


  /*
   * Business / organisation.
   *
   * Do not automatically mark it
   * as verified.
   */

  if (
    requestedType === "BUSINESS" ||
    requestedType === "ORGANISATION"
  ) {

    result.userType =
      requestedType;

    if (
      existingType !== requestedType
    ) {

      result.pendingAccountType =
        requestedType;

    }

    if (
      !result.businessVerificationStatus
    ) {

      result.businessVerificationStatus =
        "none";

    }

  }

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
    !displayName ||
    !userType
  ) {

    return {

      profileLevel: 0,

      profileStatus:
        "incomplete",

    };

  }


  /*
   * Personal account
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
   * Business / organisation
   * requires verification.
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
      req.ip ||
      null,

    userAgent:
      req.get("user-agent") ||
      null,

    updatedAt:
      new Date().toISOString(),

  };

}


/* =====================================================
   USER ID
===================================================== */

function getUserId(req) {

  return (
    req.user?.userId ||
    null
  );

}


/* =====================================================
   PATCH PROFILE SERVICE
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
   * Load current profile.
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
   * Extract only fields that
   * profile is allowed to change.
   */

  const incoming =
    pickProfileFields(
      body.profile || {}
    );


  /*
   * Merge nested state.
   */

  incoming.social =
    mergeSocialState(
      existing.social || {},
      incoming.social || {}
    );


  incoming.payment =
    mergePaymentState(
      existing.payment || {},
      incoming.payment || {}
    );


  incoming.endpoint =
    getEndpointDetails(
      req,
      mergeEndpointState(
        existing.endpoint || {},
        body.endpoint || {}
      )
    );


  /*
   * Merge profile.
   */

  let merged = {

    ...existing,

    ...incoming,

    social:
      incoming.social,

    payment:
      incoming.payment,

    endpoint:
      incoming.endpoint,

  };


  /*
   * Apply account rules.
   */

  merged =
    applyAccountTypeRules(
      existing,
      merged
    );


  /*
   * Calculate derived state.
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
   * Increment version.
   */

  merged.version =
    (existing.version || 0) + 1;


  merged.updatedAt =
    new Date();


  /*
   * Persist.
   */

  const saved =
    await updateProfile(
      merged
    );


  return {

    profile:
      saved,

    version:
      saved.version,

  };

}


/* =====================================================
   PATCH PROFILE CONTROLLER
===================================================== */

export async function patchProfile(
  req,
  res
) {

  try {

    console.log(
      "========================================"
    );

    console.log(
      "[PROFILE PATCH] START"
    );

    console.log(
      "========================================"
    );


    const userId =
      getUserId(req);


    console.log(
      "[PROFILE PATCH] USER ID:",
      userId
    );


    if (!userId) {

      return res.status(401).json({

        error:
          "Authentication required.",

      });

    }


    console.log(
      "[PROFILE PATCH] REQ.USER:",
      JSON.stringify(
        req.user,
        null,
        2
      )
    );


    console.log(
      "[PROFILE PATCH] INCOMING:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );


    const result =
      await patchProfileService({

        userId,

        body:
          req.body || {},

        req,

      });


    console.log(
      "[PROFILE PATCH] SUCCESS:",
      {
        userId,

        version:
          result.version,
      }
    );


    return res.status(200).json({

      profile:
        result.profile,

      version:
        result.version,

    });

  } catch (err) {

    console.error(
      "[PROFILE PATCH] ERROR:",
      {
        message:
          err.message,

        stack:
          process.env.NODE_ENV ===
          "development"
            ? err.stack
            : undefined,
      }
    );


    if (
      err.message ===
      "Profile not found"
    ) {

      return res.status(404).json({

        error:
          "Profile not found",

      });

    }


    return res.status(500).json({

      error:
        "Profile update failed",

      detail:
        err.message,

    });

  }

}