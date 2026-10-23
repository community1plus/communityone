import { pool } from "../src/db/pool.js";

import {
  rowToProfile,
  profileToRow,
} from "../mappers/profileMappers.js";


const TABLE = "user_profiles";


/* =====================================================
   FETCH PROFILE
===================================================== */

export async function fetchProfileByUserId(
  userId
) {

  if (!userId) {
    throw new Error(
      "Missing userId"
    );
  }

  const { rows } =
    await pool.query(
      `
        SELECT *
        FROM ${TABLE}
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

  return rows[0]
    ? rowToProfile(rows[0])
    : null;
}


/* =====================================================
   CREATE PROFILE
===================================================== */

export async function createProfile(
  profile
) {

  if (!profile?.userId) {
    throw new Error(
      "Cannot create profile without userId"
    );
  }

  const row =
    profileToRow(profile);

  console.log(
    "[PROFILE REPOSITORY] CREATE:",
    {
      userId: row.user_id,
      profileId: row.id,
    }
  );

  const { rows } =
    await pool.query(
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

          $1,
          $2,
          $3,
          $4,

          $5,
          $6,
          $7,
          $8,
          $9,

          $10::jsonb,

          $11::jsonb,
          $12::jsonb,
          $13::jsonb,

          $14,
          $15,

          $16,
          $17,

          $18,

          $19,
          $20

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
          ? JSON.stringify(
              row.home_location
            )
          : null,

        JSON.stringify(
          row.social || {}
        ),

        JSON.stringify(
          row.payment || {}
        ),

        JSON.stringify(
          row.endpoint || {}
        ),

        row.profile_level,
        row.profile_status,

        row.pending_account_type,
        row.business_verification_status,

        row.version,

        row.created_at,
        row.updated_at,
      ]
    );

  return rowToProfile(
    rows[0]
  );
}


/* =====================================================
   UPDATE PROFILE
===================================================== */

export async function updateProfile(
  profile
) {

  if (!profile?.userId) {
    throw new Error(
      "Cannot update profile without userId"
    );
  }

  const row =
    profileToRow(profile);


  console.log(
    "[PROFILE REPOSITORY] UPDATE:",
    {
      profileId:
        row.id,

      userId:
        row.user_id,

      version:
        row.version,
    }
  );


  const { rows } =
    await pool.query(
      `
        UPDATE ${TABLE}

        SET

          username =
            $1,

          display_name =
            $2,

          user_type =
            $3,

          phone =
            $4,

          phone_e164 =
            $5,

          phone_display =
            $6,

          phone_country =
            $7,

          phone_verified =
            $8,

          home_location =
            $9::jsonb,

          social =
            $10::jsonb,

          payment =
            $11::jsonb,

          endpoint =
            $12::jsonb,

          profile_level =
            $13,

          profile_status =
            $14,

          pending_account_type =
            $15,

          business_verification_status =
            $16,

          version =
            $17,

          updated_at =
            $18

        WHERE user_id =
            $19

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
          ? JSON.stringify(
              row.home_location
            )
          : null,

        JSON.stringify(
          row.social || {}
        ),

        JSON.stringify(
          row.payment || {}
        ),

        JSON.stringify(
          row.endpoint || {}
        ),

        row.profile_level,
        row.profile_status,

        row.pending_account_type,
        row.business_verification_status,

        row.version,

        row.updated_at,

        row.user_id,
      ]
    );


  if (!rows[0]) {

    throw new Error(
      `Profile update affected no rows for userId ${row.user_id}`
    );

  }


  return rowToProfile(
    rows[0]
  );
}