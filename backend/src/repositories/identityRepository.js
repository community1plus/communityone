import { pool } from "../db/pool.js";

const TABLE = "users";

/* =====================================================
   FIND BY COGNITO SUB
===================================================== */

export async function findUserByCognitoSub(
  cognitoSub
) {

  if (!cognitoSub) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE cognito_sub = $1
      LIMIT 1
    `,
    [cognitoSub]
  );

  return rows[0] || null;
}


/* =====================================================
   FIND BY USER ID
===================================================== */

export async function findUserById(
  userId
) {

  if (!userId) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}


/* =====================================================
   FIND BY EMAIL
===================================================== */

export async function findUserByEmail(
  email
) {

  if (!email) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}


/* =====================================================
   LINK COGNITO IDENTITY
===================================================== */

export async function linkCognitoIdentity(
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

  const { rows } = await pool.query(
    `
      UPDATE ${TABLE}
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
   UPDATE LAST LOGIN
===================================================== */

export async function updateLastLogin(
  userId
) {

  const { rows } = await pool.query(
    `
      UPDATE ${TABLE}
      SET
        last_login = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [userId]
  );

  return rows[0] || null;
}