import { pool } from "../src/db/db.js";

const TABLE =
  "user_profiles";

/* =========================
   MERGE SOCIAL STATE
========================= */

function mergeSocialState(
  existing = {},
  incoming = {}
) {

  return {

    facebook: {
      ...(existing.facebook || {}),
      ...(incoming.facebook || {}),
    },

    instagram: {
      ...(existing.instagram || {}),
      ...(incoming.instagram || {}),
    },

    youtube: {
      ...(existing.youtube || {}),
      ...(incoming.youtube || {}),
    },

    x: {
      ...(existing.x || {}),
      ...(incoming.x || {}),
    },
  };
}

/* =========================
   MERGE PAYMENT STATE
========================= */

function mergePaymentState(
  existing = {},
  incoming = {}
) {

  return {
    ...existing,
    ...incoming,
  };
}

/* =========================
   PICK PROFILE FIELDS
========================= */

function pickProfileFields(
  body = {}
) {

  const data = {};

  if (body.username !== undefined) {
    data.username =
      body.username;
  }

  /* =========================
     DISPLAY NAME
  ========================= */

  if (
    body.displayName !== undefined
  ) {

    data.display_name =
      body.displayName;
  }

  else if (
    body.display_name !== undefined
  ) {

    data.display_name =
      body.display_name;
  }

  /* =========================
     USER TYPE
  ========================= */

  if (
    body.userType !== undefined
  ) {

    data.user_type =
      body.userType;
  }

  else if (
    body.user_type !== undefined
  ) {

    data.user_type =
      body.user_type;
  }

  /* =========================
     PHONE
  ========================= */

  if (body.phone !== undefined) {

    data.phone =
      body.phone;
  }

  if (
    body.phoneE164 !== undefined
  ) {

    data.phone_e164 =
      body.phoneE164;
  }

  if (
    body.phoneDisplay !== undefined
  ) {

    data.phone_display =
      body.phoneDisplay;
  }

  if (
    body.phoneCountry !== undefined
  ) {

    data.phone_country =
      body.phoneCountry;
  }

  if (
    body.phoneVerified !== undefined
  ) {

    data.phone_verified =
      body.phoneVerified;
  }

  /* =========================
     HOME LOCATION
  ========================= */

  if (
    body.homeLocation !== undefined
  ) {

    data.home_location =
      body.homeLocation;
  }

  else if (
    body.home_location !== undefined
  ) {

    data.home_location =
      body.home_location;
  }

  /* =========================
     SOCIAL
  ========================= */

  if (
    body.social !== undefined
  ) {

    data.social =
      body.social;
  }

  /* =========================
     PAYMENT
  ========================= */

  if (
    body.payment !== undefined
  ) {

    data.payment =
      body.payment;
  }

  return data;
}

/* =========================
   NORMALISE PROFILE
========================= */

function normaliseProfile(
  profile
) {

  if (!profile) {
    return null;
  }

  return {

    id:
      profile.id,

    userId:
      profile.user_id,

    username:
      profile.username || "",

    displayName:
      profile.display_name || "",

    display_name:
      profile.display_name || "",

    userType:
      profile.user_type || "PERSONAL",

    user_type:
      profile.user_type || "PERSONAL",

    phone:
      profile.phone || "",

    phoneE164:
      profile.phone_e164 || "",

    phoneDisplay:
      profile.phone_display || "",

    phoneCountry:
      profile.phone_country || "AU",

    phoneVerified:
      !!profile.phone_verified,

    homeLocation:
      profile.home_location || null,

    home_location:
      profile.home_location || null,

    social:
      profile.social || {},

    payment:
      profile.payment || {},

    version:
      profile.version || 1,

    createdAt:
      profile.created_at,

    updatedAt:
      profile.updated_at,
  };
}

/* =========================
   GET PROFILE
========================= */

export async function getProfile(
  req,
  res
) {

  try {

    const userId =
      req.user.userId;

    console.log(
      "================================="
    );

    console.log(
      "GET /profile"
    );

    console.log(
      "Authenticated userId:",
      userId
    );

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

    const profile =
      result.rows[0];

    console.log(
      "FETCHED PROFILE:",
      JSON.stringify(
        profile,
        null,
        2
      )
    );

    if (!profile) {

      return res.status(404).json({
        error:
          "Profile not found",
      });
    }

    return res.json({

      profile:
        normaliseProfile(
          profile
        ),

      version:
        profile.version,
    });

  } catch (err) {

    console.error(
      "GET PROFILE FAILED:",
      err
    );

    return res.status(500).json({
      error:
        "Profile load failed",
    });
  }
}

/* =========================
   PUT PROFILE
========================= */

export async function putProfile(
  req,
  res
) {

  try {

    const userId =
      req.user.userId;

    console.log(
      "================================="
    );

    console.log(
      "PUT /profile"
    );

    console.log(
      "Authenticated userId:",
      userId
    );

    console.log(
      "RAW REQUEST BODY:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    const data =
      pickProfileFields(
        req.body
      );

    console.log(
      "PUT AFTER PICK:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    const existingResult =
      await pool.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

    const existing =
      existingResult.rows[0];

    console.log(
      "EXISTING PROFILE:",
      JSON.stringify(
        existing,
        null,
        2
      )
    );

    const now =
      new Date();

    /* =========================
       CREATE
    ========================= */

    if (!existing) {

      const inserted = {

        user_id:
          userId,

        ...data,

        social:
          mergeSocialState(
            {},
            data.social || {}
          ),

        payment:
          mergePaymentState(
            {},
            data.payment || {}
          ),

        version: 1,

        created_at:
          now,

        updated_at:
          now,
      };

      console.log(
        "INSERT PAYLOAD:",
        JSON.stringify(
          inserted,
          null,
          2
        )
      );

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
            version,
            created_at,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,
            $6,$7,$8,$9,$10,
            $11::jsonb,
            $12::jsonb,
            $13,$14,$15
          )
        `,
        [
          inserted.user_id,
          inserted.username,
          inserted.display_name,
          inserted.user_type,
          inserted.phone,
          inserted.phone_e164,
          inserted.phone_display,
          inserted.phone_country,
          inserted.phone_verified,
          inserted.home_location
            ? JSON.stringify(
                inserted.home_location
              )
            : null,
          JSON.stringify(
            inserted.social || {}
          ),
          JSON.stringify(
            inserted.payment || {}
          ),
          inserted.version,
          inserted.created_at,
          inserted.updated_at,
        ]
      );
    }

    /* =========================
       UPDATE
    ========================= */

    const mergedSocial =
      mergeSocialState(
        existing?.social || {},
        data.social || {}
      );

    const mergedPayment =
      mergePaymentState(
        existing?.payment || {},
        data.payment || {}
      );

    console.log(
      "SOCIAL MERGE:",
      JSON.stringify(
        {
          existing:
            existing?.social,

          incoming:
            data.social,

          merged:
            mergedSocial,
        },
        null,
        2
      )
    );

    const updated = {

      ...existing,

      ...data,

      social:
        mergedSocial,

      payment:
        mergedPayment,

      version:
        (existing?.version || 1) + 1,

      updated_at:
        now,
    };

    delete updated.id;
    delete updated.user_id;
    delete updated.created_at;

    console.log(
      "FINAL UPDATE:",
      JSON.stringify(
        updated,
        null,
        2
      )
    );

    await pool.query(
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
          version = $12,
          updated_at = $13
        WHERE user_id = $14
      `,
      [
        updated.username,
        updated.display_name,
        updated.user_type,
        updated.phone,
        updated.phone_e164,
        updated.phone_display,
        updated.phone_country,
        updated.phone_verified,
        updated.home_location
          ? JSON.stringify(
              updated.home_location
            )
          : null,
        JSON.stringify(
          updated.social || {}
        ),
        JSON.stringify(
          updated.payment || {}
        ),
        updated.version,
        updated.updated_at,
        userId,
      ]
    );

    console.log(
      "DB UPDATE COMPLETE"
    );

    const savedResult =
      await pool.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

    const saved =
      savedResult.rows[0];

    console.log(
      "SAVED PROFILE:",
      JSON.stringify(
        saved,
        null,
        2
      )
    );

    return res.json({

      profile:
        normaliseProfile(
          saved
        ),

      version:
        saved.version,
    });

  } catch (err) {

    console.error(
      "PUT PROFILE FAILED:",
      err
    );

    return res.status(500).json({
      error:
        "Profile save failed",
    });
  }
}

/* =========================
   PATCH PROFILE
========================= */

export async function patchProfile(
  req,
  res
) {

  try {

    const userId =
      req.user.userId;

    console.log(
      "================================="
    );

    console.log(
      "PATCH /profile"
    );

    console.log(
      "Authenticated userId:",
      userId
    );

    console.log(
      "RAW PATCH BODY:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    const patch =
      pickProfileFields(
        req.body
      );

    console.log(
      "PATCH AFTER PICK:",
      JSON.stringify(
        patch,
        null,
        2
      )
    );

    const existingResult =
      await pool.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

    const existing =
      existingResult.rows[0];

    console.log(
      "EXISTING PROFILE:",
      JSON.stringify(
        existing,
        null,
        2
      )
    );

    if (!existing) {

      return res.status(404).json({
        error:
          "Profile not found",
      });
    }

    const mergedSocial =
      mergeSocialState(
        existing.social || {},
        patch.social || {}
      );

    const mergedPayment =
      mergePaymentState(
        existing.payment || {},
        patch.payment || {}
      );

    console.log(
      "SOCIAL MERGE:",
      JSON.stringify(
        {
          existing:
            existing.social,

          incoming:
            patch.social,

          merged:
            mergedSocial,
        },
        null,
        2
      )
    );

    const updated = {

      ...existing,

      ...patch,

      social:
        mergedSocial,

      payment:
        mergedPayment,

      version:
        (existing.version || 1) + 1,

      updated_at:
        new Date(),
    };

    delete updated.id;
    delete updated.user_id;
    delete updated.created_at;

    console.log(
      "PATCH UPDATE PAYLOAD:",
      JSON.stringify(
        updated,
        null,
        2
      )
    );

    console.log(
      "DB SOCIAL WRITE:",
      JSON.stringify(
        updated.social,
        null,
        2
      )
    );

    await pool.query(
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
          version = $12,
          updated_at = $13
        WHERE user_id = $14
      `,
      [
        updated.username,
        updated.display_name,
        updated.user_type,
        updated.phone,
        updated.phone_e164,
        updated.phone_display,
        updated.phone_country,
        updated.phone_verified,
        updated.home_location
          ? JSON.stringify(
              updated.home_location
            )
          : null,
        JSON.stringify(
          updated.social || {}
        ),
        JSON.stringify(
          updated.payment || {}
        ),
        updated.version,
        updated.updated_at,
        userId,
      ]
    );

    console.log(
      "DB UPDATE COMPLETE"
    );

    const savedResult =
      await pool.query(
        `
          SELECT *
          FROM ${TABLE}
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );

    const saved =
      savedResult.rows[0];

    console.log(
      "SAVED PROFILE:",
      JSON.stringify(
        saved,
        null,
        2
      )
    );

    return res.json({

      profile:
        normaliseProfile(
          saved
        ),

      version:
        saved.version,
    });

  } catch (err) {

    console.error(
      "PATCH PROFILE FAILED:",
      err
    );

    return res.status(500).json({
      error:
        "Profile update failed",
    });
  }
}