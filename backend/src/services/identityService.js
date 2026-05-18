import {
  createIdentityRecord,
} from "../repositories/identityRepository.js";

const VALID_IDENTITY_TYPES = [
  "PERSON",
  "SYSTEM",
  "AI",
];

export async function createIdentity(data) {

  const displayName =
    data.displayName?.trim();

  if (!displayName) {
    throw new Error(
      "displayName is required"
    );
  }

  const identityType =
    data.identityType || "PERSON";

  if (
    !VALID_IDENTITY_TYPES.includes(
      identityType
    )
  ) {
    throw new Error(
      "Invalid identityType"
    );
  }

  const payload = {
    display_name: displayName,
    identity_type: identityType,
    avatar_url: data.avatarUrl || null,
  };

  const identity =
    await createIdentityRecord(payload);

  return normalizeIdentity(identity);

}

function normalizeIdentity(identity) {

  return {
    identityId:
      identity.identity_id,

    displayName:
      identity.display_name,

    identityType:
      identity.identity_type,

    avatarUrl:
      identity.avatar_url,

    status:
      identity.status,

    createdAt:
      identity.created_at,
  };

}