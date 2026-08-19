import {
  findUserByCognitoSub,
  findUserByEmail,
  findUserById,
  updateUserCognitoSub,
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

  /* =====================================================
     1. PRIMARY LOOKUP
     Cognito sub is the authoritative identity key
  ===================================================== */

  let user =
    await findUserByCognitoSub(
      cognitoSub
    );


  if (user) {

    return buildIdentity({
      user,
      cognitoSub,
      email,
      cognitoUsername,
    });

  }


  /* =====================================================
     2. LEGACY / MIGRATION LOOKUP
     
     Only attempt email recovery when Cognito has
     explicitly verified the email.
  ===================================================== */

  if (
    email &&
    emailVerified
  ) {

    user =
      await findUserByEmail(
        email
      );


    if (user) {

      console.log(
        "🔄 LINKING EXISTING USER TO CURRENT COGNITO SUB:",
        {
          userId: user.id,
          previousSub: user.cognito_sub,
          currentSub: cognitoSub,
          email,
        }
      );


      user =
        await updateUserCognitoSub(
          user.id,
          cognitoSub
        );


      return buildIdentity({
        user,
        cognitoSub,
        email,
        cognitoUsername,
      });

    }

  }


  /* =====================================================
     3. NO COMMUNITY ONE USER
  ===================================================== */

  throw new Error(
    "Cognito identity is not linked to a Community One user"
  );
}


/* =====================================================
   BUILD IDENTITY
===================================================== */

function buildIdentity({
  user,
  cognitoSub,
  email,
  cognitoUsername,
}) {

  return {

    userId:
      user.id,

    cognitoSub:
      user.cognito_sub ||
      cognitoSub,

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


  return buildIdentity({
    user,
    cognitoSub: user.cognito_sub,
    email: user.email,
    cognitoUsername: null,
  });

}