
import {
  findUserByAuthIdentity,
  findUserByCognitoSub,
  findUserById,
  findUserByEmail,
  createUserForCognitoIdentity,
  linkAuthIdentityToUser,
  markUserEmailVerified,
  updateLastLogin,
} from "../repositories/identityRepository.js";

import {
  ensurePersonParticipation,
} from "./personService.js";


function buildIdentity(
  user,
  cognitoSub,
  email,
  cognitoUsername
) {
  return {
    userId: user.id,
    cognitoSub: cognitoSub || user.cognito_sub,
    email: user.email || email || "",
    username: cognitoUsername || "",
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login,
  };
}


async function buildResolvedIdentity(
  user,
  cognitoSub,
  email,
  cognitoUsername
) {
  const identity = buildIdentity(
    user,
    cognitoSub,
    email,
    cognitoUsername
  );

  const domainContext = await ensurePersonParticipation(
    identity.userId
  );

  return {
    ...identity,
    personId: domainContext.person.personId,
    personStatus: domainContext.person.status,
    onboardingStatus:
      domainContext.participation.onboardingStatus,
    participationScope:
      domainContext.participation.participationScope,
  };
}



export async function resolveIdentity({
  cognitoSub,
  email,
  cognitoUsername,
  emailVerified = false,
  authMethod = "email",
}) {
  if (!cognitoSub) {
    throw new Error("Missing Cognito subject");
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  // 1. Existing identity: resolve directly to its user.
  const existingBySub =
    await findUserByAuthIdentity(cognitoSub) ||
    await findUserByCognitoSub(cognitoSub);

  if (existingBySub) {
    await updateLastLogin(existingBySub.id);

    return buildResolvedIdentity(
      existingBySub,
      cognitoSub,
      normalizedEmail,
      cognitoUsername
    );
  }

  if (!normalizedEmail) {
    throw new Error(
      "Cannot resolve a Community One user without an email"
    );
  }

  console.log("[IDENTITY RESOLUTION DEBUG]", {
  cognitoSub,
  normalizedEmail,
  emailVerified,
  foundByAuthIdentity: Boolean(
    await findUserByAuthIdentity(cognitoSub)
  ),
  foundByPrimarySub: Boolean(
    await findUserByCognitoSub(cognitoSub)
  ),
});

  // 2. A new identity must have a verified email.
  if (emailVerified !== true) {
    const error = new Error(
      "A verified email is required to resolve this identity"
    );
    error.code = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  // 3. An existing email belongs to the canonical user.
  const existingByEmail =
    await findUserByEmail(normalizedEmail);

  if (existingByEmail) {
    // Link the new Cognito subject without changing the
    // primary users.cognito_sub. Conflicts are rejected.
    await linkAuthIdentityToUser(
      existingByEmail.id,
      cognitoSub,
      authMethod
    );

    await markUserEmailVerified(existingByEmail.id);

    const updatedUser =
      await findUserById(existingByEmail.id);

    await updateLastLogin(existingByEmail.id);

    return buildResolvedIdentity(
      updatedUser || existingByEmail,
      cognitoSub,
      normalizedEmail,
      cognitoUsername
    );
  }

  // 4. No existing account: create the canonical user.
  const user = await createUserForCognitoIdentity({
    cognitoSub,
    email: normalizedEmail,
  });

  if (!user?.id) {
    throw new Error(
      "Community One user provisioning returned no user ID"
    );
  }

  await markUserEmailVerified(user.id);
  await updateLastLogin(user.id);

  const updatedUser = await findUserById(user.id);

  return buildResolvedIdentity(
    updatedUser || user,
    cognitoSub,
    normalizedEmail,
    cognitoUsername
  );
}
