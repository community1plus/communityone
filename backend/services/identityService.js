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
    throw new Error(
      "Missing Cognito subject"
    );
  }


  /* ===================================================
     1. PRIMARY IDENTITY LOOKUP
  =================================================== */

  const existingBySub =
    await findUserByCognitoSub(
      cognitoSub
    );


  if (existingBySub) {

    await updateLastLogin(
      existingBySub.id
    );

return buildResolvedIdentity(
  existingBySub,
  cognitoSub,
  email,
  cognitoUsername
);

  }



  /* ===================================================
     2. NO SUBJECT MATCH: PROVISION OR RECOVER ACCOUNT
  =================================================== */

  if (!email) {
    throw new Error(
      "Cannot provision a Community One user without an email"
    );
  }

  const user = await createUserForCognitoIdentity({
    cognitoSub,
    email,
  });

  await updateLastLogin(user.id);

  return buildResolvedIdentity(
    user,
    cognitoSub,
    email,
    cognitoUsername
  );


  const linkedUser =
    await linkCognitoIdentity(
      existingByEmail.id,
      cognitoSub
    );


  if (!linkedUser) {

    throw new Error(
      "Failed to link Cognito identity"
    );

  }


  await updateLastLogin(
    linkedUser.id
  );


  console.log(
    "🔗 Cognito identity linked:",
    {
      userId:
        linkedUser.id,

      cognitoSub,

      email:
        linkedUser.email,
    }
  );


return buildResolvedIdentity(
  linkedUser,
  cognitoSub,
  email,
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