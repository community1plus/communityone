import { pool } from "../db/pool.js";


/* =====================================================
   CREATE USER FOR A NEW COGNITO IDENTITY
===================================================== */

export async function createUserForCognitoIdentity({
  cognitoSub,
  email,
}) {
  if (!cognitoSub) {
    throw new Error("Missing Cognito subject");
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "A Cognito email is required to provision a Community One user"
    );
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Serialize first-login provisioning for this email.
    await client.query(
      `SELECT pg_advisory_xact_lock(
        hashtextextended($1::text, 0)
      )`,
      [normalizedEmail]
    );

    const emailResult = await client.query(
      `
        SELECT *
        FROM ${TABLE}
        WHERE LOWER(BTRIM(email)) = $1
        FOR UPDATE
      `,
      [normalizedEmail]
    );

    const emailMatches = emailResult.rows;

    if (emailMatches.length > 0) {
      const sameIdentity =
        emailMatches.length === 1 &&
        emailMatches[0].cognito_sub === cognitoSub;

      if (sameIdentity) {
        await client.query("COMMIT");
        transactionStarted = false;
        return emailMatches[0];
      }

      const error = new Error(
        "This email is already associated with another Community One identity. Explicit account linking is required."
      );

      error.code = "ACCOUNT_LINK_REQUIRED";

      throw error;
    }

    const insertResult = await client.query(
      `
        INSERT INTO ${TABLE} (
          cognito_sub,
          email
        )
        VALUES ($1, $2)
        ON CONFLICT (cognito_sub) DO NOTHING
        RETURNING *
      `,
      [cognitoSub, normalizedEmail]
    );

    let user = insertResult.rows[0];

    // Another concurrent request might have created this
    // Cognito identity while this transaction was running.
    if (!user) {
      const existingResult = await client.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE cognito_sub = $1
          LIMIT 1
        `,
        [cognitoSub]
      );

      user = existingResult.rows[0] || null;
    }

    if (!user) {
      throw new Error(
        "Unable to create or resolve the Community One user"
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return user;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "User provisioning rollback failed:",
          rollbackError.message
        );
      }
    }

    throw error;
  } finally {
    client.release();
  }
}


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