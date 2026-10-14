javascript
import { pool } from "../src/db/pool.js";

const TABLE = "persons";

/* =====================================================
   FETCH PERSON BY USER ID
===================================================== */

export async function fetchPersonByUserId(userId) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0]
    ? rowToPerson(rows[0])
    : null;
}

/* =====================================================
   CREATE PERSON FOR USER
===================================================== */

export async function createPersonForUser(userId) {
  if (!userId) {
    throw new Error(
      "Cannot create PERSON without userId"
    );
  }

  const { rows } = await pool.query(
    `
      INSERT INTO ${TABLE} (
        user_id
      )
      VALUES ($1)
      ON CONFLICT (user_id)
      DO NOTHING
      RETURNING *
    `,
    [userId]
  );

  // If another request created the PERSON concurrently,
  // retrieve the existing record instead.
  if (rows[0]) {
    return rowToPerson(rows[0]);
  }

  return fetchPersonByUserId(userId);
}

/* =====================================================
   ROW MAPPER
===================================================== */

function rowToPerson(row) {
  if (!row) {
    return null;
  }

  return {
    personId: row.person_id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
