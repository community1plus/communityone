import {
  findUserByCognitoSub,
  findUserByEmail,
  findUserById,
  linkCognitoIdentity,
  updateLastLogin,
} from "../src/repositories/identityRepository.js";


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

    return buildIdentity(
      existingBySub,
      cognitoSub,
      email,
      cognitoUsername
    );

  }


  /* ===================================================
     2. NO SUB MATCH
     Try existing Community One account
  =================================================== */

  if (!email) {

    throw new Error(
      "Cognito identity is not linked to a Community One user"
    );

  }


  const existingByEmail =
    await findUserByEmail(
      email
    );


  if (!existingByEmail) {

    throw new Error(
      "Cognito identity is not linked to a Community One user"
    );

  }


  /* ===================================================
     3. IDENTITY LINKING
  =================================================== */

  /*
   * IMPORTANT:
   *
   * For production we should require a trusted
   * identity linking flow.
   *
   * During the POC, this can be used to recover
   * the existing Community One account.
   */

  if (!emailVerified) {

    console.warn(
      "⚠️ Cognito email is not verified; linking existing account:",
      {
        userId: existingByEmail.id,
        email,
        cognitoSub,
      }
    );

  }


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


  return buildIdentity(
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