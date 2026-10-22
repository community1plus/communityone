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
      FOR UPDATE
    `,
    [cognitoSub]
  );

  return rows[0] || null;
}


/* =====================================================
   FIND BY AUTH IDENTITY
===================================================== */

export async function findUserByAuthIdentity(cognitoSub) {
  if (!cognitoSub) {
    return null;
  }

  const { rows } = await pool.query(
    `
      SELECT u.*
      FROM user_auth_identities AS a
      JOIN ${TABLE} AS u
        ON u.id = a.user_id
      WHERE a.provider = $1
        AND a.provider_subject = $2
      LIMIT 1
    `,
    ["cognito", cognitoSub]
  );

  return rows[0] || null;
}


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

    if (emailMatches.length > 0) {
      // Allow an idempotent retry for the same identity.
if (
  emailMatches.length === 1 &&
  emailMatches[0].cognito_sub === cognitoSub
  ) {
      await client.query(
        `
          INSERT INTO user_auth_identities (
            user_id,
            provider,
            provider_subject
          )
          VALUES ($1, $2, $3)
          ON CONFLICT (provider, provider_subject) DO NOTHING
        `,
        [emailMatches[0].id, "cognito", cognitoSub]
      );
      const mappingResult = await client.query(
  `
    SELECT user_id
    FROM user_auth_identities
    WHERE provider = $1
      AND provider_subject = $2
    LIMIT 1
  `,
  ["cognito", cognitoSub]
);

if (
  !mappingResult.rows[0] ||
  mappingResult.rows[0].user_id !== emailMatches[0].id
) {
  const error = new Error(
    "Cognito identity is already linked to a different Community One user"
  );

  error.code = "IDENTITY_LINK_CONFLICT";
  throw error;
}
      await client.query("COMMIT");
      transactionStarted = false;

      return emailMatches[0];
  }

      const error = new Error(
        "This email belongs to another Community One identity. Explicit account linking is required."
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

    // A concurrent request may have created this subject.
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

// Ensure this Cognito identity maps to the canonical user.
await client.query(
  `
    INSERT INTO user_auth_identities (
      user_id,
      provider,
      provider_subject
    )
    VALUES ($1, $2, $3)
    ON CONFLICT (provider, provider_subject) DO NOTHING
  `,
  [user.id, "cognito", cognitoSub]
);

const mappingResult = await client.query(
  `
    SELECT user_id
    FROM user_auth_identities
    WHERE provider = $1
      AND provider_subject = $2
    LIMIT 1
  `,
  ["cognito", cognitoSub]
);

if (
  !mappingResult.rows[0] ||
  mappingResult.rows[0].user_id !== user.id
) {
  const error = new Error(
    "Cognito identity is already linked to a different Community One user"
  );

  error.code = "IDENTITY_LINK_CONFLICT";
  throw error;
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