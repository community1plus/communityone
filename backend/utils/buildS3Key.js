import crypto from "crypto";

function sanitizeFileName(fileName = "") {
  return String(fileName)
    .replace(/[^\w.\-()\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export function buildS3Key({
  countryCode = "au",
  awsRegion = "ap-southeast-2",
  state = "vic",
  locality = "melbourne",
  userId,
  mode,
  fileName,
}) {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  const mediaId = crypto.randomUUID();

  const safeName = sanitizeFileName(fileName);

  return {
    mediaId,

    key: [
      `country=${countryCode}`,
      `region=${awsRegion}`,
      `state=${state}`,
      `locality=${locality}`,
      `userId=${userId}`,
      "posts",
      `mode=${mode}`,
      `year=${year}`,
      `month=${month}`,
      "original",
      `${mediaId}-${safeName}`,
    ].join("/"),
  };
}