import { pool } from "../db/pool.js";

import {
  rowToProfile,
  profileToRow,
} from "../mappers/profileMapper.js";

const TABLE = "user_profiles";

/* =========================================
   FETCH
========================================= */

export async function fetchProfileByUserId(
  userId
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM ${TABLE}
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

  return rowToProfile(
    result.rows[0]
  );

}

/* =========================================
   FETCH BY PROFILE ID
========================================= */

export async function fetchProfileById(
  id
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM ${TABLE}
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

  return rowToProfile(
    result.rows[0]
  );

}