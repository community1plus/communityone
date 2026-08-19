import {
  findUserByCognitoSub,
  findUserById,
} from "../repositories/identityRepository.js";


/* =====================================================
   RESOLVE COGNITO IDENTITY
===================================================== */

export async function resolveIdentity({
  cognitoSub,
  email,
  cognitoUsername,
}) {

  if (!cognitoSub) {

    throw new Error(
      "Missing Cognito subject"
    );

  }

  const user =
    await findUserByCognitoSub(
      cognitoSub
    );


  if (!user) {

    throw new Error(
      "Cognito identity is not linked to a Community One user"
    );

  }


  return {

    userId:
      user.id,

    cognitoSub:
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


  return {

    userId:
      user.id,

    cognitoSub:
      user.cognito_sub,

    email:
      user.email,

    createdAt:
      user.created_at,

    updatedAt:
      user.updated_at,

    lastLogin:
      user.last_login,

  };

}