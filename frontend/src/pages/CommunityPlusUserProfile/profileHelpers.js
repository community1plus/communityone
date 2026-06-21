import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  PROFILE_TABS,
} from "./profileConstants";

/* =========================
   EMAIL
========================= */

export function getEmailDomain(email = "") {
  return email.split("@")[1]?.toLowerCase() || "";
}

/* =========================
   PROFILE TABS
========================= */

export function getAllowedProfileTabs() {
  return PROFILE_TABS;
}

/* =========================
   PHONE COUNTRY
========================= */

export function getPhoneCountry(code) {
  return (
    PHONE_COUNTRIES.find(
      c => c.code === code
    ) ||
    PHONE_COUNTRIES.find(
      c => c.code === DEFAULT_PHONE_COUNTRY
    )
  );
}

/* =========================
   PHONE
========================= */

export function toE164Phone(
  value = "",
  countryCode = DEFAULT_PHONE_COUNTRY
) {

  const country =
    getPhoneCountry(countryCode);

  const digits = value
    .replace(/\D/g, "")
    .replace(/^0+/, "");

  if (!digits) {
    return "";
  }

  return `${country.dialCode}${digits}`;
}

export function validatePhone(
  phone,
  countryCode
) {

  const country =
    getPhoneCountry(countryCode);

  const digits = phone
    .replace(country.dialCode, "")
    .replace(/\D/g, "");

  return (
    digits.length >= country.min &&
    digits.length <= country.max
  );

}

/* =========================
   INITIAL VALUES
========================= */

export function getInitialProfileValues(
  profile,
  user
) {

  return {

    username:
      profile?.username ||
      user?.username ||
      "",

    display_name:
      profile?.displayName ||
      "",

    phoneCountry:
      profile?.phoneCountry ||
      DEFAULT_PHONE_COUNTRY,

    phoneDisplay:
      profile?.phoneDisplay ||
      "",

    homeLocation:
      profile?.homeLocation ||
      null,

    organisation: {
      name:
        profile?.organisation?.name ||
        "",
    },

  };

}