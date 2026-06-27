export const normalizeProfile = (profile) => {

  if (!profile) {
    return null;
  }

  return {

    id:
      profile.id,

    userId:
      profile.userId ??
      profile.user_id,

    username:
      profile.username ?? "",

    displayName:
      profile.displayName ??
      profile.display_name ??
      "",

    email:
      profile.email ?? "",

    userType:
      profile.userType ??
      profile.user_type ??
      "PERSONAL",

    phone:
      profile.phone ?? "",

    phoneE164:
      profile.phoneE164 ??
      profile.phone_e164 ??
      "",

    phoneDisplay:
      profile.phoneDisplay ??
      profile.phone_display ??
      "",

    phoneCountry:
      profile.phoneCountry ??
      profile.phone_country ??
      "AU",

    phoneVerified:
      profile.phoneVerified ??
      profile.phone_verified ??
      false,

    homeLocation:
      profile.homeLocation ??
      profile.home_location ??
      null,

    bio:
      profile.bio ?? "",

    website:
      profile.website ?? "",

    avatarUrl:
      profile.avatarUrl ??
      profile.avatar_url ??
      "",

    organisation:
      profile.organisation ??
      {},

    social:
      profile.social ??
      {},

    payment:
      profile.payment ??
      {},

    endpoint:
      profile.endpoint ??
      {},

    profileLevel:
      profile.profileLevel ??
      profile.profile_level ??
      0,

    profileStatus:
      profile.profileStatus ??
      profile.profile_status ??
      "incomplete",

    pendingAccountType:
      profile.pendingAccountType ??
      profile.pending_account_type ??
      null,

    businessVerificationStatus:
      profile.businessVerificationStatus ??
      profile.business_verification_status ??
      "none",

    version:
      profile.version ?? 0,

    createdAt:
      profile.createdAt ??
      profile.created_at,

    updatedAt:
      profile.updatedAt ??
      profile.updated_at,

  };

};