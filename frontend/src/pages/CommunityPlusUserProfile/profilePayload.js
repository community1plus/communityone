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

  const phoneE164 =
    toE164Phone(
      values.phoneDisplay,
      values.phoneCountry
    );

  return {

    profile: {

      /* =====================================
         USER
      ===================================== */

      username:
        values.username,

      displayName:
        values.displayName,

      email:
        values.email ||
        userEmail,

      userType:
        activeProfileTab,

      profileLevel: 1,

      /* =====================================
         CONTACT
      ===================================== */

      phone:
        phoneE164,

      phoneE164,

      phoneDisplay:
        values.phoneDisplay,

      phoneCountry:
        values.phoneCountry,

      /* =====================================
         HOME
      ===================================== */

      homeLocation:
        isOrg
          ? null
          : homeLocation,

      /* =====================================
         OTHER
      ===================================== */

      policies:
        values.policies,

      payment:
        values.payment,

    },

    organisationProfile:

      isOrg

        ? {

            ...values.organisation,

            location:
              values.organisation?.location,

            emailVerified:
              values.organisation?.emailVerified,

            ownershipVerified:
              false,

            businessLevel: 1,

            source:
              "manual",

          }

        : null,

  };

}