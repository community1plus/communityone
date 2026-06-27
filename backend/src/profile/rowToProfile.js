export function rowToProfile(row) {

  if (!row) {
    return null;
  }

  return {

    id: row.id,

    userId: row.user_id,

    username: row.username,

    displayName: row.display_name,

    email: row.email,

    userType: row.user_type,

    phone: row.phone,

    phoneE164: row.phone_e164,

    phoneDisplay: row.phone_display,

    phoneCountry: row.phone_country,

    phoneVerified: row.phone_verified,

    homeLocation: row.home_location,

    organisation: row.organisation || {},

    social: row.social || {},

    payment: row.payment || {},

    endpoint: row.endpoint || {},

    profileLevel: row.profile_level,

    profileStatus: row.profile_status,

    pendingAccountType:
      row.pending_account_type,

    businessVerificationStatus:
      row.business_verification_status,

    version: row.version,

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}