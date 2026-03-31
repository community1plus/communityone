import { pool } from "../db/index.js";

export async function getOrCreateUserWithProfile(sub, email) {
  // 1. Find or create user
  let userResult = await pool.query(
    "SELECT * FROM users WHERE cognito_sub = $1",
    [sub]
  );

  let user = userResult.rows[0];

  if (!user) {
    const insert = await pool.query(
      `INSERT INTO users (cognito_sub, email)
       VALUES ($1, $2)
       RETURNING *`,
      [sub, email]
    );
    user = insert.rows[0];
  }

  // 2. Get profile
  const profileResult = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = $1",
    [user.id]
  );

  const profile = profileResult.rows[0];

  return { user, profile };
}