

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

  const email =
    user?.email || "";

  const emailUsername =
    email
      .split("@")[0]
      .toLowerCase();

  return {

    /* =====================================
       USER
    ===================================== */

    username:
      profile?.username ||
      emailUsername,

    displayName:
      profile?.displayName ||
      "",

    /* =====================================
       CONTACT
    ===================================== */

    email,

    phoneCountry:
      profile?.phoneCountry ||
      DEFAULT_PHONE_COUNTRY,

    phoneDisplay:
      profile?.phoneDisplay ||
      "",

    /* =====================================
       HOME
    ===================================== */

    homeLocation:
      profile?.homeLocation ||
      null,

    /* =====================================
       ORGANISATION
    ===================================== */

    organisation: {

      name:
        profile?.organisation?.name ||
        "",

      website:
        profile?.organisation?.website ||
        "",

      streetAddress:
        profile?.organisation?.streetAddress ||
        "",

      suburb:
        profile?.organisation?.suburb ||
        "",

      postcode:
        profile?.organisation?.postcode ||
        "",

      phone:
        profile?.organisation?.phone ||
        "",

      email:
        profile?.organisation?.email ||
        "",

    },

  };

}