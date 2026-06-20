import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
} from "./profileConstants";

export function getEmailDomain(email = "") {
  return email.split("@")[1]?.toLowerCase() || "";
}

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

export function formatPhone(
  phone,
  countryCode
) {
  const country =
    getPhoneCountry(countryCode);

  return phone.startsWith(
    country.dialCode
  )
    ? phone.slice(
        country.dialCode.length
      )
    : phone;
}