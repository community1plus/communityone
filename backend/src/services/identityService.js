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

  return await createIdentityRecord({

    displayName,

    identityType,

    avatarUrl:
      data.avatarUrl || null,

  });

}