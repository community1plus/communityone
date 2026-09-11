import express from "express";
import crypto from "crypto";

import authMiddleware
  from "../../middleware/authMiddleware.js";

import {
  patchProfileService,
} from "../../services/profileService.js";

const router = express.Router();

const FB_AUTH_URL =
  "https://www.facebook.com/v25.0/dialog/oauth";

const FB_TOKEN_URL =
  "https://graph.facebook.com/v25.0/oauth/access_token";

const FB_GRAPH_URL =
  "https://graph.facebook.com/v25.0";

function getFrontendRedirect(params = {}) {
  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://develop.d1ss8rtrtimogr.amplifyapp.com";

  const query =
    new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}

function redirectFailure(
  res,
  reason = "facebook_verification_failed"
) {
  console.error(
    "❌ FACEBOOK FAILURE:",
    reason
  );

  return res.redirect(
    getFrontendRedirect({
      social: "facebook",
      verified: "false",
      reason,
    })
  );
}

// ============================================================
// BEGIN FACEBOOK VERIFICATION
// ============================================================

router.post(
  "/begin",
  authMiddleware,
  (req, res) => {

    console.log("=== FACEBOOK BEGIN ===");

    console.log(
      "Session ID:",
      req.sessionID
    );

    console.log(
      "Authenticated user:",
      {
        userId:
          req.user?.userId,

        cognitoSub:
          req.user?.cognitoSub,

        email:
          req.user?.email,
      }
    );

    const userId =
      req.user?.userId;

    if (!userId) {

      console.error(
        "❌ FACEBOOK BEGIN: Missing internal userId"
      );

      return res.status(401).json({
        error:
          "Authenticated user ID missing",
      });
    }

    const oauthState =
      crypto.randomUUID();

    req.session.userId =
      userId;

    req.session.fbOAuthState =
      oauthState;

    console.log(
      "Saving Facebook OAuth session:",
      {
        sessionId:
          req.sessionID,

        userId:
          req.session.userId,

        fbOAuthState:
          req.session.fbOAuthState,
      }
    );

    req.session.save((err) => {

      if (err) {

        console.error(
          "❌ FACEBOOK SESSION SAVE ERROR:",
          err
        );

        return res.status(500).json({
          error:
            "Session save failed",
        });
      }

      console.log(
        "✅ FACEBOOK SESSION SAVED"
      );

      return res.json({
        ok: true,
      });
    });
  }
);

// ============================================================
// START FACEBOOK OAUTH
// ============================================================

router.get(
  "/start",
  async (req, res) => {

    console.log("=== FACEBOOK START ===");

    console.log(
      "Session ID:",
      req.sessionID
    );

    console.log(
      "Facebook OAuth session:",
      {
        userId:
          req.session?.userId,

        fbOAuthState:
          req.session?.fbOAuthState,
      }
    );

    const userId =
      req.session?.userId;

    if (!userId) {

      return redirectFailure(
        res,
        "missing_user_session"
      );
    }

    try {

      if (
        !process.env.FACEBOOK_APP_ID ||
        !process.env.FACEBOOK_REDIRECT_URI
      ) {

        return redirectFailure(
          res,
          "facebook_oauth_not_configured"
        );
      }

      const state =
        req.session?.fbOAuthState;

      if (!state) {

        return redirectFailure(
          res,
          "missing_oauth_state"
        );
      }

      const params =
        new URLSearchParams({
          client_id:
            process.env.FACEBOOK_APP_ID,

          redirect_uri:
            process.env.FACEBOOK_REDIRECT_URI,

          response_type:
            "code",

          state,

          scope: [
            "public_profile",
            "email",
          ].join(","),
        });

      const authUrl =
        `${FB_AUTH_URL}?${params.toString()}`;

      console.log(
        "Facebook auth URL generated."
      );

      return res.redirect(authUrl);

    } catch (err) {

      console.error(
        "❌ FACEBOOK START ERROR:",
        err
      );

      return redirectFailure(
        res,
        "facebook_start_failed"
      );
    }
  }
);