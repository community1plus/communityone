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

    /* =============================================
       1. AUTHENTICATION
    ============================================= */

    if (!req.user) {
      console.warn("[ME] No authenticated user");

      return res.status(401).json({
        authenticated: false,
      });
    }

    const {
      userId: authenticatedUserId,
      id,
      cognitoSub = null,
      email: tokenEmail = "",
      username: tokenUsername = "",
      personId = null,
      personStatus = null,
      onboardingStatus = null,
      participationScope = null,
    } = req.user;

    const userId = authenticatedUserId || id || null;

    if (!userId) {
      console.error("[ME] Missing Community One userId");

      return res.status(401).json({
        authenticated: false,
        error: "User identity could not be resolved.",
      });
    }

    console.log("[ME] AUTH IDENTITY", {
      userId,
      cognitoSub,
      email: tokenEmail,
      username: tokenUsername,
      personId,
      onboardingStatus,
      participationScope,
    });

    /* =============================================
       2. FETCH LEGACY USER PROFILE
    ============================================= */

    const profileResult = await pool.query(
      `
        SELECT *
        FROM user_profiles
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    const rawProfile = profileResult.rows[0] || null;

    console.log("[ME] PROFILE", {
      found: Boolean(rawProfile),
      profileId: rawProfile?.id || null,
      userId: rawProfile?.user_id || null,
      username: rawProfile?.username || null,
      version: rawProfile?.version ?? null,
    });

    /* =============================================
       3. FETCH LEGACY ORGANISATION PROFILE
    ============================================= */

    let organisationProfile = null;

    if (rawProfile?.id) {
      const organisationResult = await pool.query(
        `
          SELECT *
          FROM organisation_profiles
          WHERE user_profile_id = $1
          LIMIT 1
        `,
        [rawProfile.id]
      );

      organisationProfile = organisationResult.rows[0] || null;

      console.log("[ME] ORGANISATION PROFILE", {
        found: Boolean(organisationProfile),
        profileId: rawProfile.id,
      });
    }

    /* =============================================
       4. NORMALIZE PROFILE
    ============================================= */

    const normalizedProfile = normalizeProfile(rawProfile);

    const canonicalEmail =
      normalizedProfile?.email || tokenEmail || "";

    const emailLocalPart =
      tokenEmail && tokenEmail.includes("@")
        ? tokenEmail.split("@")[0]
        : "";

    const canonicalUsername =
      normalizedProfile?.username ||
      (tokenEmail.includes("@") ? emailLocalPart : "") ||
      tokenUsername ||
      "";

    const profile = normalizedProfile
      ? {
          ...normalizedProfile,
          username: canonicalUsername,
          email: canonicalEmail,
          organisationProfile,
          organisation: organisationProfile,
        }
      : null;

    console.log("[ME] CANONICAL PROFILE IDENTITY", {
      username: profile?.username || canonicalUsername,
      email: profile?.email || canonicalEmail,
      userType: profile?.userType ?? null,
    });

    /* =============================================
       5. SOCIAL PROVIDER STATUS
    ============================================= */

    const social = profile?.social || {};

    const providers = {
      facebook: Boolean(social.facebook?.verified),
      instagram: Boolean(social.instagram?.verified),
      youtube: Boolean(social.youtube?.verified),
      x: Boolean(social.x?.verified),
    };

    /* =============================================
       6. USER RESPONSE
    ============================================= */

    const user = {
      // Community One account identity
      id: userId,
      cognitoSub,

      // Authenticated account information
      email: tokenEmail,

      // Community One profile presentation
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

      // Legacy profile state
      profileCompleted: Boolean(profile),
    };

    /* =============================================
       7. PERSON PARTICIPATION CONTEXT

       Supplied by authentication/identity resolution.
       No PERSON creation or authorization occurs here.
    ============================================= */

    const participation = {
      personId,
      personStatus,
      onboardingStatus,
      participationScope,
    };

    /* =============================================
       8. RESPONSE
    ============================================= */

    const response = {
      authenticated: true,
      user,
      profile,
      participation,
      providers,
    };

    console.log("[ME] SUCCESS", {
      userId,
      profileId: rawProfile?.id || null,
      version: rawProfile?.version ?? null,
      personId: participation.personId,
      onboardingStatus: participation.onboardingStatus,
      participationScope: participation.participationScope,
    });

    console.log("========================================");

    return res.status(200).json(response);
  } catch (err) {
    console.error("[ME] GET /api/me ERROR", {
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined,
    });

    return res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
});

export default router;
