import {
  findUserByCognitoSub,
  findUserById,
  createUserForCognitoIdentity,
  updateLastLogin,
} from "../src/repositories/identityRepository.js";

import {
  ensurePersonParticipation,
} from "./personService.js";


/* =====================================================
   RESOLVE IDENTITY WITH PERSON PARTICIPATION
===================================================== */

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

  const domainContext =
    await ensurePersonParticipation(
      identity.userId
    );

  return {
    ...identity,

    personId:
      domainContext.person.personId,

    personStatus:
      domainContext.person.status,

    onboardingStatus:
      domainContext.participation.onboardingStatus,

    participationScope:
      domainContext.participation.participationScope,
  };
}



/* =====================================================
   RESOLVE COGNITO IDENTITY
===================================================== */


export async function resolveIdentity({
  cognitoSub,
  email,
  cognitoUsername,
  emailVerified = false,
}) {
  if (!cognitoSub) {
    throw new Error("Missing Cognito subject");
  }

  // 1. Resolve the canonical Community One account.
  const existingBySub =
    await findUserByCognitoSub(cognitoSub);

  if (existingBySub) {
    await updateLastLogin(existingBySub.id);

    return buildResolvedIdentity(
      existingBySub,
      cognitoSub,
      email,
      cognitoUsername
    );
  }

  // 2. A new account requires a verified email.
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Cannot provision a Community One user without an email"
    );
  }

  if (emailVerified !== true) {
    const error = new Error(
      "A verified email is required to provision a Community One user"
    );

    error.code = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  // 3. Provision or recover the account.
  // Existing email conflicts must be handled through
  // explicit account linking, never automatic reassignment.
  const user = await createUserForCognitoIdentity({
    cognitoSub,
    email: normalizedEmail,
  });

  if (!user?.id) {
    throw new Error(
      "Community One user provisioning returned no user ID"
    );
  }

  await updateLastLogin(user.id);

  // 4. Ensure the domain participation records exist.
  return buildResolvedIdentity(
    user,
    cognitoSub,
    normalizedEmail,
    cognitoUsername
  );
}



/* =====================================================
   BUILD IDENTITY
===================================================== */

function buildIdentity(
  user,
  cognitoSub,
  email,
  cognitoUsername
) {

  return {

    userId:
      user.id,

    cognitoSub:
      cognitoSub ||
      user.cognito_sub,

    email:
      user.email ||
      email ||
      "",

    username:
      cognitoUsername ||
      "",

    createdAt:
      user.created_at,

    updatedAt:
      user.updated_at,

    lastLogin:
      user.last_login,

  };

}


/* =====================================================
   GET PLATFORM USER
===================================================== */

export async function getIdentityByUserId(
  userId
) {

  if (!userId) {

    throw new Error(
      "Missing Community One userId"
    );

  }


  const user =
    await findUserById(
      userId
    );


  if (!user) {

    throw new Error(
      "Community One user not found"
    );

  }


  return buildIdentity(
    user,
    user.cognito_sub,
    user.email,
    null
  );

}