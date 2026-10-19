import { pool } from "../db/pool.js";


/* =====================================================
   FIND BY COGNITO SUB
===================================================== */

export async function findUserByCognitoSub(cognitoSub) {
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

  if (rows.length === 0) {
    const { rows: metadata } = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_schema() AS schema_name,
        inet_server_addr()::text AS server_address
    `);

    console.warn("[IDENTITY LOOKUP MISS]", {
      cognitoSubSuffix: cognitoSub.slice(-12),
      database: metadata[0]?.database_name,
      schema: metadata[0]?.schema_name,
      server: metadata[0]?.server_address,
    });
  }

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