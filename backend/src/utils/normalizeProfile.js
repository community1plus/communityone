export const normalizeProfile = (profile) => {

  if (!profile) return null;

  return {

    id:
      profile.id,

    userId:
      profile.user_id,

    username:
      profile.username ?? "",

    displayName:
      profile.display_name ?? "",

    userType:
      profile.user_type ?? "PERSONAL",

    phoneCountry:
      profile.phone_country ?? "AU",

    phone:
      profile.phone ?? "",

    bio:
      profile.bio ?? "",

    website:
      profile.website ?? "",

    avatarUrl:
      profile.avatar_url ?? "",

    social:
      profile.social ?? {},

    createdAt:
      profile.created_at,

    updatedAt:
      profile.updated_at,
  };
};