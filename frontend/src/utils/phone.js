export function normaliseAustralianPhone(phone = "") {
  const digits = phone.replace(/[^\d+]/g, "");

  // already E.164
  if (digits.startsWith("+61")) {
    return digits;
  }

  // local Australian mobile
  if (digits.startsWith("0")) {
    return `+61${digits.slice(1)}`;
  }

  return digits;
}

export function formatAustralianPhone(phone = "") {
  if (!phone) return "";

  if (!phone.startsWith("+61")) {
    return phone;
  }

  const local = "0" + phone.slice(3);

  if (local.length === 10) {
    return `${local.slice(0,4)} ${local.slice(4,7)} ${local.slice(7)}`;
  }

  return local;
}

export function validateAustralianPhone(phone = "") {
  return /^\+614\d{8}$/.test(phone);
}