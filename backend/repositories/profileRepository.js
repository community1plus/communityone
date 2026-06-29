import { pool } from "../src/db/pool.js"
import {
  rowToProfile,
  profileToRow,
} from "../mappers/profileMappers.js";

const TABLE = "user_profiles";

/* =========================
   FETCH
========================= */

export async function fetchProfileByUserId(userId) {

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rowToProfile(rows[0]);

}

/* =========================
   UPDATE
========================= */

export async function updateProfile(
  userId,
  profile
) {

  const row =
    profileToRow(profile);

  const { rows } =
    await pool.query(
      `
      UPDATE ${TABLE}
      SET
        username = $2,
        display_name = $3,
        user_type = $4,
        phone = $5,
        phone_e164 = $6,
        phone_display = $7,
        phone_country = $8,
        phone_verified = $9,
        home_location = $10,
        social = $11::jsonb,
        payment = $12::jsonb,
        endpoint = $13::jsonb,
        profile_level = $14,
        profile_status = $15,
        business_verification_status = $16,
        version = version + 1,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
      `,
      [
        userId,

        row.username,

        row.display_name,

        row.user_type,

        row.phone,

        row.phone_e164,

        row.phone_display,

        row.phone_country,

        row.phone_verified,

        row.home_location
          ? JSON.stringify(row.home_location)
          : null,

        JSON.stringify(row.social || {}),

        JSON.stringify(row.payment || {}),

        JSON.stringify(row.endpoint || {}),

        row.profile_level,

        row.profile_status,

        row.business_verification_status,
      ]
    );

  return rowToProfile(
    rows[0]
  );

}