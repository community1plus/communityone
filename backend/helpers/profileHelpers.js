const ACCOUNT_TYPES = ["PERSONAL", "ORG", "MIXED"];

export function cleanString(value = "") {
  return String(value || "").trim();
}

export function normaliseAccountType(value = "PERSONAL") {
  const clean = cleanString(value).toUpperCase();
  return ACCOUNT_TYPES.includes(clean) ? clean : "PERSONAL";
}

export function isBusinessType(userType) {
  return ["ORG", "MIXED"].includes(normaliseAccountType(userType));
}

export function getUserId(req) {
  return req.user?.id || req.user?.sub;
}


export function pickProfileFields(body = {}) {

  const data = {};

  if (body.username !== undefined) {
    data.username = cleanString(body.username);
  }

  /* =====================================
     DISPLAY NAME
  ===================================== */

  if (body.displayName !== undefined) {

    data.displayName =
      cleanString(body.displayName);

  } else if (body.display_name !== undefined) {

    // Temporary compatibility during migration
    data.displayName =
      cleanString(body.display_name);

  }

  /* =====================================
     USER TYPE
  ===================================== */

  if (body.userType !== undefined) {

    data.userType =
      normaliseAccountType(body.userType);

  } else if (body.user_type !== undefined) {

    data.userType =
      normaliseAccountType(body.user_type);

  }

  /* =====================================
     PHONE
  ===================================== */

  if (body.phone !== undefined) {
    data.phone = cleanString(body.phone);
  }

  if (body.phoneE164 !== undefined) {

    data.phoneE164 =
      cleanString(body.phoneE164);

  } else if (body.phone_e164 !== undefined) {

    data.phoneE164 =
      cleanString(body.phone_e164);

  }

  if (body.phoneDisplay !== undefined) {

    data.phoneDisplay =
      cleanString(body.phoneDisplay);

  } else if (body.phone_display !== undefined) {

    data.phoneDisplay =
      cleanString(body.phone_display);

  }

  if (body.phoneCountry !== undefined) {

    data.phoneCountry =
      cleanString(body.phoneCountry || "AU");

  } else if (body.phone_country !== undefined) {

    data.phoneCountry =
      cleanString(body.phone_country || "AU");

  }

  if (body.phoneVerified !== undefined) {

    data.phoneVerified =
      Boolean(body.phoneVerified);

  } else if (body.phone_verified !== undefined) {

    data.phoneVerified =
      Boolean(body.phone_verified);

  }

  /* =====================================
     HOME
  ===================================== */

  if (body.homeLocation !== undefined) {

    data.homeLocation =
      body.homeLocation;

  } else if (body.home_location !== undefined) {

    data.homeLocation =
      body.home_location;

  }

  /* =====================================
     SOCIAL
  ===================================== */

  console.log(
    "INCOMING SOCIAL:",
    JSON.stringify(body.social, null, 2)
  );

  if (body.social !== undefined) {
    data.social = body.social || {};
  }

  /* =====================================
     PAYMENT
  ===================================== */

  if (body.payment !== undefined) {
    data.payment = body.payment || {};
  }

  /* =====================================
     ENDPOINT
  ===================================== */

  if (body.endpoint !== undefined) {
    data.endpoint = body.endpoint || {};
  }

  /* =====================================
     BUSINESS VERIFICATION
  ===================================== */

  if (body.businessVerificationStatus !== undefined) {

    data.businessVerificationStatus =
      cleanString(body.businessVerificationStatus);

  } else if (body.business_verification_status !== undefined) {

    data.businessVerificationStatus =
      cleanString(body.business_verification_status);

  }

  /* =====================================
     ORGANISATION
  ===================================== */

  if (body.organisation !== undefined) {

    data.organisation =
      body.organisation || {};

  }

  return data;

}

export function pickOrganisationFields(body = {}) {
const org = body;

if (!org) {
  return null;
}

  if (!org) return null;

  const organisationName = cleanString(
    org.organisation_name ||
      org.organisationName ||
      org.name
  );

  if (!organisationName) return null;

  return {
    organisation_name: organisationName,
    trading_name: cleanString(org.trading_name || org.tradingName || org.name),
    organisation_email: cleanString(
      org.organisation_email ||
        org.organisationEmail ||
        org.email
    ),
    organisation_phone: cleanString(
      org.organisation_phone ||
        org.organisationPhone ||
        org.phone
    ),
    website: cleanString(org.website),
    location: org.location || null,
    email_verified: Boolean(org.email_verified || org.emailVerified),
    phone_verified: Boolean(org.phone_verified || org.phoneVerified),
    ownership_verified: Boolean(org.ownership_verified || org.ownershipVerified),
    business_level: org.business_level || org.businessLevel || 1,
    source: org.source || "manual",
  };
}