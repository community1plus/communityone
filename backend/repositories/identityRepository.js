
import { pool } from "../db/pool.js";

const TABLE = "users";


/* =====================================================
   FIND BY COGNITO SUBJECT
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

  return rows[0] || null;
}


/* =====================================================
   FIND BY USER ID
===================================================== */

export async function findUserById(userId) {
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

export async function findUserByEmail(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE LOWER(BTRIM(email)) = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  return rows[0] || null;
}


/* =====================================================
   CREATE USER FOR A NEW COGNITO IDENTITY
===================================================== */

/**
 * Creates a Community One user when the Cognito subject
 * is not already linked to an application account.
 *
 * Existing email ownership conflicts are rejected.
 * This function does not automatically link identities
 * based on email alone.
 */
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

    // Serialize provisioning attempts for this email.
    await client.query(
      `
        SELECT pg_advisory_xact_lock(
          hashtextextended($1::text, 0)
        )
      `,
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
      // Idempotent recovery if another request has already
      // created this exact subject/email combination.
      if (
        emailMatches.length === 1 &&
        emailMatches[0].cognito_sub === cognitoSub
      ) {
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

    let user = insertResult.rows[0] || null;

    // Another request might have created this subject
    // concurrently. Reuse that account rather than duplicate it.
    if (!user) {
      const existingResult = await client.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE cognito_sub = $1
          LIMIT 1
          FOR UPDATE
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
   LINK COGNITO IDENTITY
===================================================== */

/**
 * Links a Cognito subject only when the target user
 * has no subject or already has this same subject.
 *
 * Existing subjects are never silently overwritten.
 */
export async function linkCognitoIdentity(
  userId,
  cognitoSub
) {
  if (!userId) {
    throw new Error("Missing Community One userId");
  }

  if (!cognitoSub) {
    throw new Error("Missing Cognito subject");
  }

  const { rows } = await pool.query(
    `
      UPDATE ${TABLE} AS target
      SET
        cognito_sub = $2,
        updated_at = NOW()
      WHERE target.id = $1
        AND (
          target.cognito_sub IS NULL
          OR target.cognito_sub = $2
        )
        AND NOT EXISTS (
          SELECT 1
          FROM ${TABLE} AS existing
          WHERE existing.cognito_sub = $2
            AND existing.id <> $1
        )
      RETURNING target.*
    `,
    [userId, cognitoSub]
  );

  return rows[0] || null;
}


/* =====================================================
   LEGACY COMPATIBILITY
===================================================== */

export async function updateUserCognitoSub(
  userId,
  cognitoSub
) {
  return linkCognitoIdentity(userId, cognitoSub);
}


/* =====================================================
   UPDATE LAST LOGIN
===================================================== */

export async function updateLastLogin(userId) {
  if (!userId) {
    throw new Error("Missing Community One userId");
  }

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
