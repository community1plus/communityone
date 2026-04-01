import { pool } from "../db/index.js";

export async function getOrCreateUserWithProfile(sub, email) {
  const client = await pool.connect();

  // 🔥 DEBUG OBJECT (THIS GOES TO FRONTEND)
  const debug = {
    rawSub: sub,
    cleanedSub: null,
    subLength: null,
    steps: []
  };

  try {
    /* =========================
       🧠 SANITISE + VALIDATION
    ========================= */
    const rawSub = sub;
    sub = (sub || "").trim();

    debug.cleanedSub = sub;
    debug.subLength = sub.length;
    debug.steps.push("sanitised");

    console.log("➡️ userService INPUT:", { rawSub, sub, email });

    if (!sub) {
      throw new Error("Missing cognito_sub");
    }

    await client.query("BEGIN");

    /* =========================
       🔍 1. GET USER
    ========================= */
    debug.steps.push("select_user");

    const userResult = await client.query(
      "SELECT * FROM users WHERE cognito_sub = $1 LIMIT 1",
      [sub]
    );

    let user = userResult.rows[0];

    debug.steps.push(user ? "user_found" : "user_not_found");

    /* =========================
       🔥 2. CREATE USER IF NOT EXISTS
    ========================= */
    if (!user) {
      debug.steps.push("insert_user");

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
    }

    if (!user || !user.id) {
      throw new Error("User creation failed");
    }

    /* =========================
       🔍 3. GET PROFILE
    ========================= */
    debug.steps.push("select_profile");

    const profileResult = await client.query(
      "SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1",
      [user.id]
    );

    const profile = profileResult.rows[0] || null;

    debug.steps.push(profile ? "profile_found" : "no_profile");

    await client.query("COMMIT");

    return {
      user,
      profile,
      debug // 🔥 RETURN DEBUG
    };

  } catch (err) {
    await client.query("ROLLBACK");

    console.error("🔥 userService FULL ERROR:", err);

    return {
      user: null,
      profile: null,
      debug,
      error: err.message
    };

  } finally {
    client.release();
  }
}