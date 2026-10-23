
import express from "express";

import { pool } from "../db/pool.js";
import { normalizeProfile } from "../../utils/normalizeProfile.js";
import { getProfileService } from "../../services/profileService.js";
import {
  fetchParticipationByPersonId,
  updateParticipationStatus,
} from "../../repositories/personParticipationRepository.js";

const router = express.Router();

const ALLOWED_ONBOARDING_STATUSES = new Set([
  "GUEST",
  "IN_PROGRESS",
  "COMPLETED",
]);

function getEmailLocalPart(email = "") {
  return email.includes("@") ? email.split("@")[0] : "";
}

function hasMinimumProfile(profile) {
  const location =
    profile?.homeLocation ??
    profile?.home_location ??
    null;

  const hasUsername =
    typeof profile?.username === "string" &&
    Boolean(profile.username.trim());

  const hasPhone = [
    profile?.phone,
    profile?.phoneDisplay,
    profile?.phoneE164,
  ].some(
    (value) =>
      value != null &&
      Boolean(String(value).trim())
  );

  const hasValidLocation =
    typeof location?.lat === "number" &&
    Number.isFinite(location.lat) &&
    typeof location?.lng === "number" &&
    Number.isFinite(location.lng);

  return hasUsername && hasPhone && hasValidLocation;
}

function sendParticipationError(res, status, error) {
  return res.status(status).json({ error });
}



export function createParticipationHandler({
  fetchParticipationByPersonId,
  updateParticipationStatus,
  getProfileService,
}) {
  return async function participationHandler(req, res) {
    const personId = req.user?.personId;
    const userId = req.user?.userId || req.user?.id;

    const requestedStatus = String(
      req.body?.onboardingStatus ?? ""
    )
      .trim()
      .toUpperCase();

    if (!personId || !userId) {
      return sendParticipationError(
        res,
        409,
        "The authenticated user has no participation record."
      );
    }

    if (!ALLOWED_ONBOARDING_STATUSES.has(requestedStatus)) {
      return sendParticipationError(
        res,
        400,
        "Invalid onboarding status."
      );
    }

    try {
      const current =
        await fetchParticipationByPersonId(personId);

      if (!current) {
        return sendParticipationError(
          res,
          404,
          "Participation record not found."
        );
      }

      const currentStatus = String(
        current.onboardingStatus ?? ""
      ).toUpperCase();

      // Repeated requests for the existing status are no-ops.
      if (currentStatus === requestedStatus) {
        return res.status(200).json({
          participation: current,
        });
      }

      // Completed onboarding is immutable.
      if (currentStatus === "COMPLETED") {
        return sendParticipationError(
          res,
          409,
          "Completed onboarding cannot be downgraded."
        );
      }

      // Completion is only valid from IN_PROGRESS.
      if (requestedStatus === "COMPLETED") {
        if (currentStatus !== "IN_PROGRESS") {
          return sendParticipationError(
            res,
            409,
            "Onboarding must be in progress before it can be completed."
          );
        }

        const result = await getProfileService({ userId });

        if (!hasMinimumProfile(result?.profile)) {
          return sendParticipationError(
            res,
            400,
            "The minimum profile is incomplete. Username, phone and a valid home location are required."
          );
        }
      }

      const updated = await updateParticipationStatus(
        personId,
        requestedStatus
      );

      if (updated) {
        return res.status(200).json({
          participation: updated,
        });
      }

      // The database may reject a transition if another request
      // changed the participation after our initial read.
      const latest =
        await fetchParticipationByPersonId(personId);

      if (!latest) {
        return sendParticipationError(
          res,
          404,
          "Participation record not found."
        );
      }

      const latestStatus = String(
        latest.onboardingStatus ?? ""
      ).toUpperCase();

      // Another request may already have completed this transition.
      if (latestStatus === requestedStatus) {
        return res.status(200).json({
          participation: latest,
        });
      }

      if (latestStatus === "COMPLETED") {
        return sendParticipationError(
          res,
          409,
          "Completed onboarding cannot be downgraded."
        );
      }

      return sendParticipationError(
        res,
        409,
        "Unable to update onboarding status."
      );
    } catch (error) {
      console.error("[ME] PARTICIPATION UPDATE FAILED", {
        message: error?.message,
      });

      return sendParticipationError(
        res,
        500,
        "Failed to update onboarding status."
      );
    }
  };
}



/* =====================================================
   GET CURRENT USER
===================================================== */

router.get("/", async (req, res) => {
  try {
    console.log("========================================");
    console.log("📡 GET /api/me");

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

    // Fetch the legacy profile associated with the account.
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

    // Preserve the legacy organisation-profile relationship.
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

      organisationProfile =
        organisationResult.rows[0] || null;

      console.log("[ME] ORGANISATION PROFILE", {
        found: Boolean(organisationProfile),
        profileId: rawProfile.id,
      });
    }

    const normalizedProfile = normalizeProfile(rawProfile);

    const canonicalEmail =
      normalizedProfile?.email || tokenEmail || "";

    const emailLocalPart = getEmailLocalPart(tokenEmail);

    const canonicalUsername =
      normalizedProfile?.username ||
      emailLocalPart ||
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

    const social = profile?.social || {};

    const providers = {
      facebook: Boolean(social.facebook?.verified),
      instagram: Boolean(social.instagram?.verified),
      youtube: Boolean(social.youtube?.verified),
      x: Boolean(social.x?.verified),
    };

    const user = {
      // Community One account identity.
      id: userId,
      cognitoSub,

      // Authenticated account information.
      email: tokenEmail,

      // Profile presentation.
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

      // Legacy profile state; not the onboarding status.
      profileCompleted: Boolean(profile),
    };

    // Participation context is supplied by identity resolution.
    // This handler does not create or authorize participation.
    const participation = {
      personId,
      personStatus,
      onboardingStatus,
      participationScope,
    };

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
  } catch (error) {
    console.error("[ME] GET /api/me ERROR", {
      message: error.message,
      stack:
        process.env.NODE_ENV === "development"
          ? error.stack
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
router.patch(
  "/participation",
  createParticipationHandler({
    fetchParticipationByPersonId,
    updateParticipationStatus,
    getProfileService,
  })
);



export default router;
