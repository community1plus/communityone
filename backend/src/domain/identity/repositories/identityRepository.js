import pool from "../db/pool.js";

export async function createIdentityRecord(
  payload
) {

  const query = `
    INSERT INTO identities (
      display_name,
      identity_type,
      avatar_url
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [
    payload.display_name,
    payload.identity_type,
    payload.avatar_url,
  ];

  const result =
    await pool.query(query, values);

  return result.rows[0];

}