
import { pool } from "../src/db/pool.js";

const TABLE = "users";
const AUTH_IDENTITY_TABLE = "user_auth_identities";
const AUTH_PROVIDER = "cognito";

/* =====================================================
   FIND BY COGNITO SUBJECT
===================================================== */


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

/* =====================================================
   LEGACY COGNITO IDENTITY LINK
   Additional identities must be linked through an
   explicit, verified account-linking flow.
===================================================== */

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

  const error = new Error(
    "Legacy Cognito identity linking is disabled. Use the explicit authentication identity linking flow."
  );

  error.code = "EXPLICIT_LINK_REQUIRED";

  throw error;
}


/* =====================================================
   LEGACY COMPATIBILITY
===================================================== */

export async function updateUserCognitoSub(userId, cognitoSub) {
  return linkCognitoIdentity(userId, cognitoSub);
}


/* =====================================================
   LINK VERIFIED AUTH IDENTITY TO EXISTING USER

   The caller must independently verify ownership of
   the second Cognito identity before calling this.
   Never updates users.cognito_sub.
===================================================== */


export async function linkAuthIdentityToUser(
  userId,
  cognitoSub,
  authMethod
) {
  if (!userId) {
    throw new Error("Missing Community One userId");
  }

  if (!cognitoSub) {
    throw new Error("Missing Cognito subject");
  }

  const normalizedAuthMethod = String(authMethod || "")
    .trim()
    .toLowerCase();

  const allowedAuthMethods = new Set([
    "google",
    "facebook",
    "email",
  ]);

  if (!allowedAuthMethods.has(normalizedAuthMethod)) {
    const error = new Error(
      "Unsupported authentication method"
    );
    error.code = "INVALID_AUTH_METHOD";
    throw error;
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the canonical Community One user.
    const userResult = await client.query(
      `
        SELECT id
        FROM ${TABLE}
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    );

    if (!userResult.rows.length) {
      const error = new Error(
        "Community One user not found"
      );
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // An identity must never be reassigned to another user.
    const existingResult = await client.query(
      `
        SELECT user_id
        FROM user_auth_identities
        WHERE provider = $1
          AND provider_subject = $2
        FOR UPDATE
      `,
      ["cognito", cognitoSub]
    );

    if (existingResult.rows.length) {
      if (
        String(existingResult.rows[0].user_id) !==
        String(userId)
      ) {
        const error = new Error(
          "This authentication identity is linked to another Community One user"
        );
        error.code = "IDENTITY_LINK_CONFLICT";
        throw error;
      }

      // Same user: refresh the originating-method metadata.
      await client.query(
        `
          UPDATE user_auth_identities
          SET
            auth_method = $3,
            updated_at = NOW()
          WHERE provider = $1
            AND provider_subject = $2
        `,
        ["cognito", cognitoSub, normalizedAuthMethod]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return {
        userId,
        cognitoSub,
        authMethod: normalizedAuthMethod,
        alreadyLinked: true,
      };
    }

    const insertResult = await client.query(
      `
        INSERT INTO user_auth_identities (
          user_id,
          provider,
          provider_subject,
          auth_method
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (provider, provider_subject)
        DO NOTHING
        RETURNING user_id
      `,
      [
        userId,
        "cognito",
        cognitoSub,
        normalizedAuthMethod,
      ]
    );

    if (!insertResult.rows.length) {
      // A concurrent request may have inserted this subject.
      const retryResult = await client.query(
        `
          SELECT user_id
          FROM user_auth_identities
          WHERE provider = $1
            AND provider_subject = $2
          FOR UPDATE
        `,
        ["cognito", cognitoSub]
      );

      if (
        !retryResult.rows.length ||
        String(retryResult.rows[0].user_id) !==
          String(userId)
      ) {
        const error = new Error(
          "This authentication identity is linked to another Community One user"
        );
        error.code = "IDENTITY_LINK_CONFLICT";
        throw error;
      }

      // The concurrent insert belongs to this user.
      await client.query(
        `
          UPDATE user_auth_identities
          SET
            auth_method = $3,
            updated_at = NOW()
          WHERE provider = $1
            AND provider_subject = $2
        `,
        ["cognito", cognitoSub, normalizedAuthMethod]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      userId,
      cognitoSub,
      authMethod: normalizedAuthMethod,
      alreadyLinked: false,
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Authentication identity link rollback failed:",
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
   MARK COMMUNITY ONE EMAIL AS VERIFIED
===================================================== */

export async function markUserEmailVerified(userId) {
  if (!userId) {
    throw new Error("Missing Community One userId");
  }


  const { rows } = await pool.query(
    `
      UPDATE users
      SET email_verified = TRUE,
          email_verified_at = COALESCE(email_verified_at, NOW()),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, email_verified, email_verified_at
    `,
    [userId]
  );

  if (!rows.length) {
    const error = new Error("Community One user not found");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return rows[0];
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
