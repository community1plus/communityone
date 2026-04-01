import { pool } from "../db/index.js";

export async function getOrCreateUserWithProfile(sub, email) {
  const client = await pool.connect();

  try {
    /* =========================
       🧠 VALIDATION
    ========================= */
    if (!sub) {
      throw new Error("Missing cognito_sub");
    }

    console.log("➡️ userService INPUT:", { sub, email });

    /* =========================
       🔒 USE TRANSACTION (IMPORTANT)
    ========================= */
    await client.query("BEGIN");

    /* =========================
       🔍 1. GET USER
    ========================= */
    console.log("🧪 SELECT user...");
    const userResult = await client.query(
      "SELECT * FROM users WHERE cognito_sub = $1 LIMIT 1",
      [sub]
    );

    let user = userResult.rows[0];

    console.log("📦 SELECT result:", user);

    /* =========================
       🔥 2. CREATE USER IF NOT EXISTS
    ========================= */
    if (!user) {
      console.log("👤 INSERT user...");

      const insertResult = await client.query(
        `
        INSERT INTO users (cognito_sub, email)
        VALUES ($1, $2)
        ON CONFLICT (cognito_sub)
        DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
        RETURNING *;
        `,
        [sub, email]
      );

      user = insertResult.rows[0];

      console.log("📦 INSERT result:", user);
    }

    if (!user || !user.id) {
      throw new Error("User creation failed (no id returned)");
    }

    /* =========================
       🔍 3. GET PROFILE
    ========================= */
    console.log("🧪 SELECT profile...");

    const profileResult = await client.query(
      "SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1",
      [user.id]
    );

    const profile =
      profileResult.rows.length > 0
        ? profileResult.rows[0]
        : null;

    console.log("📄 profile:", profile ? "FOUND" : "NONE");

    /* =========================
       ✅ COMMIT
    ========================= */
    await client.query("COMMIT");

    /* =========================
       📦 RETURN
    ========================= */
    return {
      user,
      profile
    };

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("🔥 userService FULL ERROR:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      detail: err.detail
    });

    throw err;

  } finally {
    client.release();
  }
}