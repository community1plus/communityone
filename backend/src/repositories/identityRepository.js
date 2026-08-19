import { pool } from "../db/pool.js";


/* =====================================================
   FIND USER BY COGNITO SUBJECT
===================================================== */

export async function findUserByCognitoSub(
  cognitoSub
) {

  if (!cognitoSub) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT
        id,
        cognito_sub,
        email,
        created_at,
        updated_at,
        last_login
      FROM users
      WHERE cognito_sub = $1
      LIMIT 1
    `,
    [cognitoSub]
  );

  return rows[0] || null;
}


/* =====================================================
   FIND USER BY INTERNAL USER ID
===================================================== */

export async function findUserById(
  userId
) {

  if (!userId) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT
        id,
        cognito_sub,
        email,
        created_at,
        updated_at,
        last_login
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}