import express from "express";
import { pool } from "../db/pool.js";
import { normalizeProfile } from "../utils/normalizeProfile.js";

const router = express.Router();


/* =====================================================
   GET CURRENT USER
===================================================== */

router.get("/", async (req, res) => {

  try {

    console.log("========================================");
    console.log("📡 GET /api/me");


    /* ===================================================
       AUTHENTICATION
    =================================================== */

    if (!req.user) {

      console.warn(
        "[ME] No authenticated user"
      );

      return res.status(401).json({
        authenticated: false,
      });

    }


    /* ===================================================
       COMMUNITY ONE IDENTITY
       
       req.user.userId = internal Community One UUID
       req.user.sub    = Cognito subject
    =================================================== */

    const userId =
      req.user.userId ||
      req.user.id ||
      null;

    const cognitoSub =
      req.user.sub ||
      null;

    const tokenEmail =
      req.user.email ||
      req.user.attributes?.email ||
      "";

    const tokenUsername =
      req.user.username ||
      req.user["cognito:username"] ||
      req.user.attributes?.preferred_username ||
      "";


    console.log(
      "[ME] AUTH IDENTITY:",
      {
        userId,
        cognitoSub,
        email: tokenEmail,
        username: tokenUsername,
      }
    );


    if (!userId) {

      console.error(
        "[ME] Authenticated request has no Community One userId"
      );

      return res.status(401).json({
        authenticated: false,
        error: "User identity could not be resolved.",
      });

    }


    /* ===================================================
       PROFILE
       
       IMPORTANT:
       user_profiles.user_id is the Community One
       internal user UUID — NOT Cognito sub.
    =================================================== */

    const profileResult =
      await pool.query(
        `
          SELECT *
          FROM user_profiles
          WHERE user_id = $1
          LIMIT 1
        `,
        [userId]
      );


    const rawProfile =
      profileResult.rows[0] || null;


    console.log(
      "[ME] PROFILE:",
      {
        found: !!rawProfile,
        profileId: rawProfile?.id || null,
        userId: rawProfile?.user_id || null,
        username: rawProfile?.username || null,
        version: rawProfile?.version || null,
      }
    );


    /* ===================================================
       ORGANISATION PROFILE
    =================================================== */

    let organisationProfile = null;


    if (rawProfile?.id) {

      const organisationResult =
        await pool.query(
          `
            SELECT *
            FROM organisation_profiles
            WHERE user_profile_id = $1
            LIMIT 1
          `,
          [rawProfile.id]
        );


      organisationProfile =
        organisationResult.rows[0] || null;


      console.log(
        "[ME] ORGANISATION PROFILE:",
        {
          found: !!organisationProfile,
          profileId: rawProfile.id,
        }
      );

    }


    /* ===================================================
       NORMALISE PROFILE
    =================================================== */

    const normalizedProfile =
      normalizeProfile(rawProfile);


    const profile = {

      ...normalizedProfile,

      organisationProfile,

      organisation:
        organisationProfile,

    };


    console.log(
      "[ME] NORMALIZED PROFILE:",
      JSON.stringify(
        profile,
        null,
        2
      )
    );


    /* ===================================================
       SOCIAL PROVIDERS
    =================================================== */

    const social =
      profile?.social || {};


    const providers = {

      facebook:
        !!social?.facebook?.verified,

      instagram:
        !!social?.instagram?.verified,

      youtube:
        !!social?.youtube?.verified,

      x:
        !!social?.x?.verified,

    };


    /* ===================================================
       USER RESPONSE
    =================================================== */

    const emailLocalPart =
      tokenEmail &&
      tokenEmail.includes("@")
        ? tokenEmail.split("@")[0]
        : "";


    const user = {

      /*
       * Community One identity
       */
      id:
        userId,


      /*
       * Cognito identity is deliberately
       * kept separate.
       */
      cognitoSub:
        cognitoSub,


      email:
        tokenEmail,


      username:
        profile?.username ||
        emailLocalPart ||
        tokenUsername ||
        "",


      displayName:
        profile?.displayName ||
        emailLocalPart ||
        tokenUsername ||
        "",


      profileCompleted:
        !!profile,

    };


    /* ===================================================
       RESPONSE
    =================================================== */

    const response = {

      authenticated: true,

      user,

      profile,

      providers,

    };


    console.log(
      "[ME] SUCCESS:",
      {
        userId,
        profileId:
          rawProfile?.id || null,
        version:
          rawProfile?.version || null,
      }
    );


    console.log("========================================");


    return res.status(200).json(
      response
    );


  } catch (err) {

    console.error(
      "❌ [ME] GET /api/me ERROR:",
      {
        message: err.message,
        stack: err.stack,
      }
    );


    return res.status(500).json({

      error:
        "Failed to fetch current user",

      detail:
        err.message,

    });

  }

});


export default router;