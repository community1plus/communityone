import { pool } from "../db/pool.js";

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

  return rows[0] || null;
}

/* =========================
   UPDATE
========================= */

export async function updateProfile(userId, fields) {
  const {
    username,
    display_name,
    user_type,
    phone,
    phone_e164,
    phone_display,
    phone_country,
    phone_verified,
    home_location,
    social,
    payment,
    endpoint,
    profile_level,
    profile_status,
    business_verification_status,
  } = fields;

  const { rows } = await pool.query(
    `
    UPDATE ${TABLE}
    SET
      username=$2,
      display_name=$3,
      user_type=$4,
      phone=$5,
      phone_e164=$6,
      phone_display=$7,
      phone_country=$8,
      phone_verified=$9,
      home_location=$10,
      social=$11::jsonb,
      payment=$12::jsonb,
      endpoint=$13::jsonb,
      profile_level=$14,
      profile_status=$15,
      business_verification_status=$16,
      version=version+1,
      updated_at=NOW()
    WHERE user_id=$1
    RETURNING *
    `,
    [
      userId,
      username,
      display_name,
      user_type,
      phone,
      phone_e164,
      phone_display,
      phone_country,
      phone_verified,
      home_location,
      JSON.stringify(social || {}),
      JSON.stringify(payment || {}),
      JSON.stringify(endpoint || {}),
      profile_level,
      profile_status,
      business_verification_status,
    ]
  );

  return rows[0];
}