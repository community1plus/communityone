
import deepmerge from "deepmerge";

const TABLE = "user_profiles";

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
   PICK PROFILE FIELDS
========================= */

function pickProfileFields(body = {}) {

  const data = {};

  if (body.username !== undefined) {
    data.username = body.username;
  }

  /* =========================
     DISPLAY NAME
  ========================= */

  if (body.displayName !== undefined) {
    data.display_name = body.displayName;
  }

  else if (body.display_name !== undefined) {
    data.display_name = body.display_name;
  }

  /* =========================
     USER TYPE
  ========================= */

  if (body.userType !== undefined) {
    data.user_type = body.userType;
  }

  else if (body.user_type !== undefined) {
    data.user_type = body.user_type;
  }

  /* =========================
     PHONE
  ========================= */

  if (body.phone !== undefined) {
    data.phone = body.phone;
  }

  if (body.phoneE164 !== undefined) {
    data.phone_e164 = body.phoneE164;
  }

  if (body.phoneDisplay !== undefined) {
    data.phone_display = body.phoneDisplay;
  }

  if (body.phoneCountry !== undefined) {
    data.phone_country = body.phoneCountry;
  }

  if (body.phoneVerified !== undefined) {
    data.phone_verified = body.phoneVerified;
  }

  /* =========================
     HOME LOCATION
  ========================= */

  if (body.homeLocation !== undefined) {
    data.home_location = body.homeLocation;
  }

  else if (body.home_location !== undefined) {
    data.home_location = body.home_location;
  }

  /* =========================
     SOCIAL
  ========================= */

  if (body.social !== undefined) {
    data.social = body.social;
  }

  /* =========================
     PAYMENT
  ========================= */

  if (body.payment !== undefined) {
    data.payment = body.payment;
  }

  return data;
}

/* =========================
   NORMALISE PROFILE
========================= */

function normaliseProfile(profile) {

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
   GET /profile
========================= */

export async function getProfile(req, res) {

  try {

    const userId =
  req.user.id ||
  req.user.sub;

    console.log("=================================");
    console.log("GET /profile");
    console.log("Authenticated userId:", userId);

    const profile =
      await db(TABLE)
        .where({ user_id: userId })
        .first();

    console.log(
      "Fetched profile:",
      JSON.stringify(profile, null, 2)
    );

    if (!profile) {

      return res.status(404).json({
        error: "Profile not found",
      });
    }

    return res.json({

      profile:
        normaliseProfile(profile),

      version:
        profile.version,
    });

  } catch (err) {

    console.error(
      "Profile load failed:",
      err
    );

    return res.status(500).json({
      error: "Profile load failed",
    });
  }
}

/* =========================
   PUT /profile
========================= */

export async function putProfile(req, res) {

  try {

    const userId =
  req.user.id ||
  req.user.sub;

    console.log("=================================");
    console.log("PUT /profile");
    console.log("Authenticated userId:", userId);

    console.log(
      "Raw request body:",
      JSON.stringify(req.body, null, 2)
    );

      console.log(
  "PATCH BODY:",
  JSON.stringify(req.body, null, 2)
);
    const data =
      pickProfileFields(req.body);


      const data =
  pickProfileFields(req.body);
  
    console.log(
      "PUT AFTER PICK:",
      JSON.stringify(data, null, 2)
    );

    const existing =
      await db(TABLE)
        .where({ user_id: userId })
        .first();

    console.log(
      "EXISTING PROFILE:",
      JSON.stringify(existing, null, 2)
    );

    const now = new Date();

    /* =========================
       CREATE PROFILE
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
        JSON.stringify(inserted, null, 2)
      );

      await db(TABLE)
        .insert(inserted);

      const profile =
        await db(TABLE)
          .where({ user_id: userId })
          .first();

      return res.status(201).json({

        profile:
          normaliseProfile(profile),

        version:
          profile.version,
      });
    }

    /* =========================
       UPDATE EXISTING PROFILE
    ========================= */

    const mergedSocial =
      mergeSocialState(
        existing.social || {},
        data.social || {}
      );

    const mergedPayment =
      mergePaymentState(
        existing.payment || {},
        data.payment || {}
      );

    console.log(
      "SOCIAL MERGE:",
      JSON.stringify(
        {
          existing:
            existing.social,

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
        (existing.version || 1) + 1,

      updated_at:
        now,
    };

    /* =========================
       PREVENT DB POLLUTION
    ========================= */

    delete updated.id;
    delete updated.user_id;
    delete updated.created_at;

    console.log(
      "FINAL UPDATE:",
      JSON.stringify(updated, null, 2)
    );

    await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    console.log(
      "DB UPDATE COMPLETE"
    );

    const profile =
      await db(TABLE)
        .where({ user_id: userId })
        .first();

    console.log(
      "SAVED PROFILE:",
      JSON.stringify(profile, null, 2)
    );

    return res.json({

      profile:
        normaliseProfile(profile),

      version:
        profile.version,
    });

  } catch (err) {

    console.error(
      "Profile save failed:",
      err
    );

    return res.status(500).json({
      error: "Profile save failed",
    });
  }
}

/* =========================
   PATCH /profile
========================= */

export async function patchProfile(req, res) {

  try {

    const userId =
  req.user.id ||
  req.user.sub;

    console.log("=================================");
    console.log("PATCH /profile");
    console.log("Authenticated userId:", userId);

    console.log(
      "Raw patch body:",
      JSON.stringify(req.body, null, 2)
    );

    const patch =
      pickProfileFields(req.body);

    console.log(
      "PATCH AFTER PICK:",
      JSON.stringify(patch, null, 2)
    );

    const clientVersion =
      req.headers["x-version"];

    console.log(
      "Client version:",
      clientVersion
    );

    const profile =
      await db(TABLE)
        .where({ user_id: userId })
        .first();

    console.log(
      "EXISTING PROFILE:",
      JSON.stringify(profile, null, 2)
    );

    if (!profile) {

      return res.status(404).json({
        error: "Profile not found",
      });
    }

    if (
      clientVersion &&
      Number(clientVersion) !== profile.version
    ) {

      console.log(
        "VERSION CONFLICT"
      );

      return res.status(409).json({

        error:
          "VERSION_CONFLICT",

        serverProfile:
          normaliseProfile(profile),

        serverVersion:
          profile.version,
      });
    }

    /* =========================
       MERGE CANONICAL STATE
    ========================= */

    const mergedSocial =
      mergeSocialState(
        profile.social || {},
        patch.social || {}
      );

    const mergedPayment =
      mergePaymentState(
        profile.payment || {},
        patch.payment || {}
      );

    console.log(
      "SOCIAL MERGE:",
      JSON.stringify(
        {
          existing:
            profile.social,

          incoming:
            patch.social,

          merged:
            mergedSocial,
        },
        null,
        2
      )
    );

    /* =========================
       SAFE PATCH UPDATE
    ========================= */

    const updated =
      deepmerge(
        profile,
        patch
      );

    /* =========================
       FORCE CANONICAL MERGES
    ========================= */

    updated.social =
      mergedSocial;

    updated.payment =
      mergedPayment;

    updated.version =
      (profile.version || 1) + 1;

    updated.updated_at =
      new Date();

    /* =========================
       PREVENT DB POLLUTION
    ========================= */

    delete updated.id;
    delete updated.user_id;
    delete updated.created_at;

    console.log(
      "PATCH UPDATE PAYLOAD:",
      JSON.stringify(updated, null, 2)
    );

    console.log(
      "DB SOCIAL WRITE:",
      JSON.stringify(
        updated.social,
        null,
        2
      )
    );

    await db(TABLE)
      .where({ user_id: userId })
      .update(updated);

    console.log(
      "DB UPDATE COMPLETE"
    );

    const nextProfile =
      await db(TABLE)
        .where({ user_id: userId })
        .first();

    console.log(
      "SAVED PROFILE:",
      JSON.stringify(nextProfile, null, 2)
    );

    return res.json({

      profile:
        normaliseProfile(nextProfile),

      version:
        nextProfile.version,
    });

  } catch (err) {

    console.error(
      "Profile update failed:",
      err
    );

    return res.status(500).json({
      error: "Profile update failed",
    });
  }
}

