/* =========================================
   DATABASE ROW -> APPLICATION MODEL
========================================= */

export function rowToProfile(row) {

  if (!row) {
    return null;
  }

  return {
    id: row.id,

    userId: row.user_id,

    username:
      row.username ?? "",

    displayName:
      row.display_name ?? "",

    email:
      row.email ?? "",

    userType:
      row.user_type ?? "PERSONAL",

    profileLevel:
      row.profile_level ?? 0,

    profileStatus:
      row.profile_status ?? "incomplete",

    phone:
      row.phone ?? "",

    phoneE164:
      row.phone_e164 ?? "",

    phoneDisplay:
      row.phone_display ?? "",

    phoneCountry:
      row.phone_country ?? "AU",

    phoneVerified:
      !!row.phone_verified,

    homeLocation:
      row.home_location ?? null,

    social:
      row.social ?? {},

    payment:
      row.payment ?? {},

    endpoint:
      row.endpoint ?? {},

    pendingAccountType:
      row.pending_account_type ?? null,

    businessVerificationStatus:
      row.business_verification_status ?? "none",

    version:
      row.version ?? 0,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}


/* =========================================
   APPLICATION MODEL -> DATABASE ROW
========================================= */

export function profileToRow(
  profile = {}
) {

  return {

    id:
      profile.id,

    user_id:
      profile.userId,

    username:
      profile.username ?? "",

    display_name:
      profile.displayName ?? "",

    email:
      profile.email ?? "",

    user_type:
      profile.userType ?? "PERSONAL",

    profile_level:
      profile.profileLevel ?? 0,

    profile_status:
      profile.profileStatus ?? "incomplete",

    phone:
      profile.phone ?? "",

    phone_e164:
      profile.phoneE164 ?? "",

    phone_display:
      profile.phoneDisplay ?? "",

    phone_country:
      profile.phoneCountry ?? "AU",

    phone_verified:
      !!profile.phoneVerified,

    home_location:
      profile.homeLocation ?? null,

    social:
      profile.social ?? {},

    payment:
      profile.payment ?? {},

    endpoint:
      profile.endpoint ?? {},

    pending_account_type:
      profile.pendingAccountType ?? null,

    business_verification_status:
      profile.businessVerificationStatus ?? "none",

    version:
      profile.version ?? 0,

    created_at:
      profile.createdAt,

    updated_at:
      profile.updatedAt,
  };
}