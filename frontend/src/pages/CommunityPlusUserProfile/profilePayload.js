import { toE164Phone }
  from "./profileHelpers";

export function buildProfilePayload({
  values,
  activeProfileTab,
  userEmail,
  homeLocation,
}) {

  const isOrg =
    activeProfileTab === "ORG";

  const orgLocation =
    values.organisation?.location;

  const phoneE164 =
    toE164Phone(
      values.phoneDisplay,
      values.phoneCountry
    );

  return {
    profile: {
      username: values.username,

      display_name:
        values.display_name,

      displayName:
        values.display_name,

      email:
        values.email ||
        userEmail,

      user_type:
        activeProfileTab,

      profile_level: 1,

      phone: phoneE164,

      phoneE164,

      phoneDisplay:
        values.phoneDisplay,

      phoneCountry:
        values.phoneCountry,

      homeLocation:
        isOrg
          ? orgLocation
          : homeLocation,

      policies:
        values.policies,

      payment:
        values.payment,
    },

    organisationProfile:
      isOrg
        ? {
            organisation_name:
              values.organisation
                ?.name,

            organisation_email:
              values.organisation
                ?.email,

            organisation_phone:
              values.organisation
                ?.phone,

            website:
              values.organisation
                ?.website,

            location:
              orgLocation,

            email_verified:
              values.organisation
                ?.emailVerified,

            ownership_verified:
              false,

            business_level: 1,

            source:
              "manual",
          }
        : null,
  };
}