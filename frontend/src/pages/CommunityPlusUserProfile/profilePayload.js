import { toE164Phone } from "../../../src/framework/Workspace/profile/profileHelpers";

export function buildProfilePayload({
  values,
  userEmail,
  homeLocation,
}) {

  const userType =
    values.userType ||
    values.identityType ||
    "PERSONAL";

  const isOrg =
    userType === "ORG";

  const phoneE164 =
    toE164Phone(
      values.phoneDisplay,
      values.phoneCountry
    );

  return {

    profile: {

      username:
        values.username || "",

      displayName:
        values.displayName || "",

      email:
        values.email ||
        userEmail ||
        "",

      userType,

      profileLevel:
        1,

      phone:
        phoneE164,

      phoneE164,

      phoneDisplay:
        values.phoneDisplay || "",

      phoneCountry:
        values.phoneCountry || "AU",

      homeLocation:
        isOrg
          ? null
          : homeLocation,

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

            businessLevel:
              1,

            source:
              "manual",
          }
        : null,

  };

}