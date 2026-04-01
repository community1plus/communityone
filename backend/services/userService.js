import { pool } from "../db/index.js";

export async function getOrCreateUserWithProfile(sub, email) {
  try {
    /* =========================
       🧠 VALIDATION
    ========================= */
    if (!sub) {
      throw new Error("Missing cognito_sub");
    }

    console.log("➡️ userService start:", { sub, email });

    /* =========================
       🔥 1. GET OR CREATE USER
    ========================= */

    let user;

    // Try fetch existing user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE cognito_sub = $1",
      [sub]
    );

    user = userResult.rows[0];

    // Create if not exists
    if (!user) {
      console.log("👤 Creating new user:", sub);

      const insertResult = await pool.query(
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
    }

    if (!user) {
      throw new Error("Failed to create or fetch user");
    }

    console.log("✅ user resolved:", user.id);

    /* =========================
       🔍 2. GET PROFILE
    ========================= */

    let profile = null;

    const profileResult = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1",
      [user.id]
    );

    if (profileResult.rows.length > 0) {
      profile = profileResult.rows[0];
    }

    console.log("📄 profile:", profile ? "FOUND" : "NONE");

    /* =========================
       📦 3. RETURN
    ========================= */

    return {
      user,
      profile
    };

  } catch (err) {
    console.error("🔥 userService FULL ERROR:", err);
    throw err;
  }
}