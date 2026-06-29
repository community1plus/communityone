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

export async function saveProfile({ userId, incoming }) {
  const now = new Date();
  const existing = await fetchProfileByUserId(userId);

const base = existing || {
  userId: userId,
  username: "",
  displayName: "",
  email: "",
  userType: "PERSONAL",

  phone: "",
  phoneE164: "",
  phoneDisplay: "",
  phoneCountry: "AU",
  phoneVerified: false,

  homeLocation: null,

  organisation: {},

  social: {},
  payment: {},
  endpoint: {},

  profileLevel: 0,
  profileStatus: "incomplete",
  pendingAccountType: null,
  businessVerificationStatus: "none",

  version: 0,

  createdAt: now,
};

const merged = {
  ...base,
  ...incoming,

  social: mergeSocialState(
    base.social || {},
    incoming.social || {}
  ),

  payment: mergePaymentState(
    base.payment || {},
    incoming.payment || {}
  ),

  endpoint: mergeEndpointState(
    base.endpoint || {},
    incoming.endpoint || {}
  ),

  organisation: {
    ...(base.organisation || {}),
    ...(incoming.organisation || {}),
  },

  version: (base.version || 0) + 1,

  updatedAt: now,
};
const accountResolved =
  applyAccountTypeRules(
    base,
    merged
  );


  const profileState = calculateProfileState(accountResolved);

  const finalProfile = {
    ...accountResolved,
    profile_level: profileState.profile_level,
    profile_status: profileState.profile_status,
    updated_at: now,
  };

  const row = profileToRow(finalProfile);

  if (!existing) {
    const result = await pool.query(
      `
        INSERT INTO ${TABLE} (
          user_id,
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
          pending_account_type,
          business_verification_status,
          version,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11::jsonb,$12::jsonb,$13::jsonb,
          $14,$15,$16,$17,$18,$19,$20
        )
        RETURNING *
      `,
[
  row.user_id,
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

  JSON.stringify(row.social),

  JSON.stringify(row.payment),

  JSON.stringify(row.endpoint),

  row.profile_level,

  row.profile_status,

  row.pending_account_type,

  row.business_verification_status,

  row.version,

  row.created_at,

  row.updated_at,
]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `
      UPDATE ${TABLE}
      SET
        username = $1,
        display_name = $2,
        user_type = $3,
        phone = $4,
        phone_e164 = $5,
        phone_display = $6,
        phone_country = $7,
        phone_verified = $8,
        home_location = $9::jsonb,
        social = $10::jsonb,
        payment = $11::jsonb,
        endpoint = $12::jsonb,
        profile_level = $13,
        profile_status = $14,
        pending_account_type = $15,
        business_verification_status = $16,
        version = $17,
        updated_at = $18
      WHERE user_id = $19
      RETURNING *
    `,
[
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

  JSON.stringify(row.social),

  JSON.stringify(row.payment),

  JSON.stringify(row.endpoint),

  row.profile_level,

  row.profile_status,

  row.pending_account_type,

  row.business_verification_status,

  row.version,

  row.updated_at,

  userId,
]
  );

  return result.rows[0];
}