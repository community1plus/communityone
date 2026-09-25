import { pool } from "../db/pool.js";


/* =====================================================
   FIND BY COGNITO SUB
===================================================== */

export async function findUserByCognitoSub(
  cognitoSub
) {

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
   FIND BY EMAIL
===================================================== */

export async function findUserByEmail(
  email
) {

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
   UPDATE COGNITO SUB
===================================================== */

export async function updateUserCognitoSub(
  userId,
  cognitoSub
) {

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

  return rows[0] || null;
}


/* =====================================================
   FIND BY COMMUNITY ONE USER ID
===================================================== */

export async function findUserById(
  userId
) {

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