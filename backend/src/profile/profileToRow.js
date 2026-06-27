export function profileToRow(profile) {

  if (!profile) {
    return null;
  }

  return {

    user_id: profile.userId,

    username: profile.username,

    display_name: profile.displayName,

    email: profile.email,

    user_type: profile.userType,

    phone: profile.phone,

    phone_e164: profile.phoneE164,

    phone_display: profile.phoneDisplay,

    phone_country: profile.phoneCountry,

    phone_verified: profile.phoneVerified,

    home_location: profile.homeLocation,

    organisation: profile.organisation || {},

    social: profile.social || {},

    payment: profile.payment || {},

    endpoint: profile.endpoint || {},

    profile_level: profile.profileLevel,

    profile_status: profile.profileStatus,

    pending_account_type:
      profile.pendingAccountType,

    business_verification_status:
      profile.businessVerificationStatus,

    version: profile.version,

    created_at: profile.createdAt,

    updated_at: profile.updatedAt,

  };

}