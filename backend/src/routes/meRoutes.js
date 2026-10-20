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


/* =====================================================
   UPDATE CURRENT USER ONBOARDING STATUS
===================================================== */

router.patch("/participation", async (req, res) => {
  const personId = req.user?.personId;
  const userId = req.user?.userId || req.user?.id;

  const onboardingStatus = String(
    req.body?.onboardingStatus || ""
  )
    .trim()
    .toUpperCase();

  const allowedStatuses = new Set([
    "GUEST",
    "IN_PROGRESS",
    "COMPLETED",
  ]);

  if (!personId || !userId) {
    return res.status(409).json({
      error: "The authenticated user has no participation record.",
    });
  }

  if (!allowedStatuses.has(onboardingStatus)) {
    return res.status(400).json({
      error: "Invalid onboarding status.",
    });
  }

  try {
    // Only mark onboarding complete after verifying the
    // same minimum-profile criteria used by the frontend.
    if (onboardingStatus === "COMPLETED") {
      const result = await getProfileService({ userId });
      const profile = result?.profile;

      const location =
        profile?.homeLocation ||
        profile?.home_location ||
        null;

      const hasUsername =
        typeof profile?.username === "string" &&
        Boolean(profile.username.trim());

      const hasPhone = Boolean(
        String(
          profile?.phone ||
          profile?.phoneDisplay ||
          profile?.phoneE164 ||
          ""
        ).trim()
      );

      const hasLocation =
        typeof location?.lat === "number" &&
        Number.isFinite(location.lat) &&
        typeof location?.lng === "number" &&
        Number.isFinite(location.lng);

      if (!hasUsername || !hasPhone || !hasLocation) {
        return res.status(400).json({
          error:
            "The minimum profile is incomplete. Username, phone and a valid home location are required.",
        });
      }
    }

    const updated = await updateParticipationStatus(
      personId,
      onboardingStatus
    );

    if (updated) {
      return res.status(200).json({
        participation: updated,
      });
    }

    // Distinguish a missing record from an already completed
    // record, or an attempt to change completed participation.
    const current = await fetchParticipationByPersonId(
      personId
    );

    if (!current) {
      return res.status(404).json({
        error: "Participation record not found.",
      });
    }

    if (current.onboardingStatus === onboardingStatus) {
      return res.status(200).json({
        participation: current,
      });
    }

    if (current.onboardingStatus === "COMPLETED") {
      return res.status(409).json({
        error: "Completed onboarding cannot be downgraded.",
      });
    }

    return res.status(409).json({
      error: "Unable to update onboarding status.",
    });
  } catch (error) {
    console.error(
      "[ME] PARTICIPATION UPDATE FAILED",
      {
        message: error?.message,
      }
    );

    return res.status(500).json({
      error: "Failed to update onboarding status.",
    });
  }
});


export default router;
