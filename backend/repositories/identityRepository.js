
import { pool } from "../db/pool.js";

const TABLE = "users";
const AUTH_IDENTITY_TABLE = "user_auth_identities";
const AUTH_PROVIDER = "cognito";

/* =====================================================
   FIND BY COGNITO SUBJECT
===================================================== */

export async function findUserByCognitoSub(cognitoSub) {
  if (!cognitoSub) return null;

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
   FIND BY AUTHENTICATION IDENTITY
===================================================== */

export async function findUserByAuthIdentity(cognitoSub) {
  if (!cognitoSub) return null;

  const { rows } = await pool.query(
    `
      SELECT u.*
      FROM ${AUTH_IDENTITY_TABLE} AS a
      JOIN ${TABLE} AS u ON u.id = a.user_id
      WHERE a.provider = $1
        AND a.provider_subject = $2
      LIMIT 1
    `,
    [AUTH_PROVIDER, cognitoSub]
  );

  return rows[0] || null;
}

/* =====================================================
   FIND BY USER ID
===================================================== */

export async function findUserById(userId) {
  if (!userId) return null;

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

  if (!normalizedEmail) return null;

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
   ENSURE AUTH IDENTITY MAPPING
===================================================== */

/**
 * Adds a mapping for a Cognito subject to a canonical
 * Community One user.
 *
 * Never reassigns a subject already owned by another user.
 * Must be called inside a transaction using the same client.
 */
async function ensureAuthIdentityMapping(
  client,
  userId,
  cognitoSub
) {
  await client.query(
    `
      INSERT INTO ${AUTH_IDENTITY_TABLE} (
        user_id,
        provider,
        provider_subject
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (provider, provider_subject) DO NOTHING
    `,
    [userId, AUTH_PROVIDER, cognitoSub]
  );

  const { rows } = await client.query(
    `
      SELECT user_id
      FROM ${AUTH_IDENTITY_TABLE}
      WHERE provider = $1
        AND provider_subject = $2
      LIMIT 1
    `,
    [AUTH_PROVIDER, cognitoSub]
  );

  if (!rows[0] || String(rows[0].user_id) !== String(userId)) {
    const error = new Error(
      "Cognito identity is already linked to a different Community One user"
    );

    error.code = "IDENTITY_LINK_CONFLICT";
    throw error;
  }
}

/* =====================================================
   CREATE OR RECOVER USER FOR COGNITO IDENTITY
===================================================== */

/**
 * Creates a user for a new Cognito subject or recovers
 * the existing user for an idempotent retry.
 *
 * An existing email belonging to another Community One
 * user is never linked automatically.
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

    // Serialise provisioning attempts for the same email.
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
    let user = null;

    if (emailMatches.length > 0) {
      if (
        emailMatches.length === 1 &&
        emailMatches[0].cognito_sub === cognitoSub
      ) {
        user = emailMatches[0];
      } else {
        const error = new Error(
          "This email is already associated with another Community One identity. Explicit account linking is required."
        );

        error.code = "ACCOUNT_LINK_REQUIRED";
        throw error;
      }
    } else {
      const insertResult = await client.query(
        `
          INSERT INTO ${TABLE} (cognito_sub, email)
          VALUES ($1, $2)
          ON CONFLICT (cognito_sub) DO NOTHING
          RETURNING *
        `,
        [cognitoSub, normalizedEmail]
      );

      user = insertResult.rows[0] || null;

      // Recover a user created concurrently for this subject.
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
    }

    // Keep the user record and identity mapping consistent.
    await ensureAuthIdentityMapping(
      client,
      user.id,
      cognitoSub
    );

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
   LINK COGNITO IDENTITY — LEGACY COMPATIBILITY
===================================================== */

/**
 * Legacy operation. Updates the primary cognito_sub only
 * when it is empty or already matches.
 *
 * Do not use this function to link an additional provider.
 */
export async function linkCognitoIdentity(userId, cognitoSub) {
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

export async function updateUserCognitoSub(userId, cognitoSub) {
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
