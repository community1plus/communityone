import { pool } from "../db/index.js";

export async function getOrCreateUserWithProfile(sub, email) {
  try {
    if (!sub) {
      throw new Error("Missing cognito_sub");
    }

    /* =========================
       1. GET OR CREATE USER
    ========================= */

    let user;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE cognito_sub = $1",
      [sub]
    );

    user = userResult.rows[0];

    // 🔥 Create user if not exists (safe + idempotent)
    if (!user) {
      console.log("👤 Creating new user:", sub);

      const insert = await pool.query(
        `
        INSERT INTO users (cognito_sub, email)
        VALUES ($1, $2)
        ON CONFLICT (cognito_sub)
        DO UPDATE SET email = EXCLUDED.email
        RETURNING *;
        `,
        [sub, email]
      );

      user = insert.rows[0];
    }

    /* =========================
       2. GET PROFILE
    ========================= */

    const profileResult = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [user.id]
    );

    const profile = profileResult.rows[0] || null;

    /* =========================
       3. RETURN SAFE RESPONSE
    ========================= */

    return {
      user,
      profile,
    };

  } catch (err) {
    console.error("🔥 userService error:", err);
    throw err; // 🔥 bubble up to controller
  }
}