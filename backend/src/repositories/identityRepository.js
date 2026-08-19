import { pool } from "../db/pool.js";


/* =====================================================
   FIND USER BY COGNITO SUB
===================================================== */

export async function findUserByCognitoSub(
  cognitoSub
) {

  if (!cognitoSub) {
    return null;
  }

  const { rows } =
    await pool.query(
      `
        SELECT *
        FROM users
        WHERE cognito_sub = $1
        LIMIT 1
      `,
      [cognitoSub]
    );

  return rows[0] || null;
}


/* =====================================================
   FIND USER BY EMAIL
===================================================== */

export async function findUserByEmail(
  email
) {

  if (!email) {
    return null;
  }

  const { rows } =
    await pool.query(
      `
        SELECT *
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email]
    );

  return rows[0] || null;
}


/* =====================================================
   FIND USER BY COMMUNITY ONE USER ID
===================================================== */

export async function findUserById(
  userId
) {

  if (!userId) {
    return null;
  }

  const { rows } =
    await pool.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

  return rows[0] || null;
}


/* =====================================================
   LINK COGNITO IDENTITY
===================================================== */

export async function updateUserCognitoSub(
  userId,
  cognitoSub
) {

  if (!userId) {
    throw new Error(
      "Missing Community One userId"
    );
  }

  if (!cognitoSub) {
    throw new Error(
      "Missing Cognito subject"
    );
  }

  const { rows } =
    await pool.query(
      `
        UPDATE users
        SET
          cognito_sub = $2,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        userId,
        cognitoSub,
      ]
    );

  if (!rows[0]) {
    throw new Error(
      "Community One user not found"
    );
  }

  return rows[0];
}