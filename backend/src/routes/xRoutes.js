import express from "express";
import crypto from "crypto";
import pkceChallenge from "pkce-challenge";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   X OAUTH CONFIG
========================= */

const X_AUTH_URL =
  "https://twitter.com/i/oauth2/authorize";

const X_TOKEN_URL =
  "https://api.x.com/2/oauth2/token";

const X_ME_URL =
  "https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url,verified,description,public_metrics";

/* =========================
   FRONTEND REDIRECT
========================= */

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
  reason = "x_verification_failed"
) {

  console.error(
    "❌ X FAILURE:",
    reason
  );

  return res.redirect(
    getFrontendRedirect({

      social: "x",

      verified: "false",

      reason,

    })
  );
}

/* =========================
   BEGIN OAUTH
========================= */

router.post(
  "/begin",
  authMiddleware,
  async (req, res) => {

    try {

      const state =
        crypto.randomUUID();

const {
  code_verifier,
  code_challenge,
} = await pkceChallenge();

req.session.userSub =
  req.user.sub;

req.session.xOAuthState =
  state;

req.session.xCodeVerifier =
  code_verifier;

req.session.xCodeChallenge =
  code_challenge;

    } catch (err) {

      console.error(
        "❌ X BEGIN ERROR:",
        err
      );

      return res.status(500).json({

        error:
          "x_begin_failed",

      });

    }

  }
);

/* =========================
   START OAUTH
========================= */

router.get(
  "/start",
  async (req, res) => {

    try {

      console.log(
        "=== X START ==="
      );

      console.log(
        "Session:",
        req.sessionID
      );

      if (!req.session.userSub) {

        return redirectFailure(
          res,
          "missing_user_session"
        );

      }

      if (
        !process.env.X_CLIENT_ID ||
        !process.env.X_REDIRECT_URI
      ) {

        return redirectFailure(
          res,
          "x_oauth_not_configured"
        );

      }

      const state =
        req.session.xOAuthState;

const codeChallenge =
  req.session.xCodeChallenge;

      const params =
        new URLSearchParams({

          response_type:
            "code",

          client_id:
            process.env.X_CLIENT_ID,

          redirect_uri:
            process.env.X_REDIRECT_URI,

          scope:
            "users.read tweet.read offline.access",

          state,

code_challenge:
  codeChallenge,

          code_challenge_method:
            "S256",

        });

      const authUrl =
        `${X_AUTH_URL}?${params.toString()}`;

      console.log(
        "🚀 Redirecting to X..."
      );

      return res.redirect(
        authUrl
      );

    } catch (err) {

      console.error(
        "❌ X START ERROR:",
        err
      );

      return redirectFailure(
        res,
        "x_start_failed"
      );

    }

  }
);
/* =========================
   CALLBACK
========================= */

router.get(
  "/callback",
  async (req, res) => {

    try {

      const {
        code,
        error,
        state,
      } = req.query;

      console.log(
        "=== X CALLBACK ==="
      );

      if (!req.session.userSub) {

        return redirectFailure(
          res,
          "missing_user_session"
        );

      }

      if (error) {

        return redirectFailure(
          res,
          String(error)
        );

      }

      if (!code) {

        return redirectFailure(
          res,
          "missing_x_code"
        );

      }

      if (
        state !==
        req.session.xOAuthState
      ) {

        console.error(
          "❌ X STATE MISMATCH"
        );

        return redirectFailure(
          res,
          "x_state_mismatch"
        );

      }

      /* =========================
         TOKEN EXCHANGE
      ========================= */

      const tokenResponse =
        await fetch(
          X_TOKEN_URL,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/x-www-form-urlencoded",

            },

            body:
              new URLSearchParams({

                grant_type:
                  "authorization_code",

                code,

                redirect_uri:
                  process.env.X_REDIRECT_URI,

                client_id:
                  process.env.X_CLIENT_ID,

                code_verifier:
                  req.session.xCodeVerifier,

              }),

          }
        );

      const tokenData =
        await tokenResponse.json();

      console.log(
        "X TOKEN",
        tokenData
      );

      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {

        return redirectFailure(
          res,
          "x_token_exchange_failed"
        );

      }

      /* =========================
         GET USER
      ========================= */

      const meResponse =
        await fetch(
          X_ME_URL,
          {

            headers: {

              Authorization:
                `Bearer ${tokenData.access_token}`,

            },

          }
        );

      const meData =
        await meResponse.json();

      console.log(
        "X PROFILE",
        meData
      );

      if (
        !meResponse.ok ||
        !meData.data
      ) {

        return redirectFailure(
          res,
          "x_profile_lookup_failed"
        );

      }

      const user =
        meData.data;

      /* =========================
         CLEAN SESSION
      ========================= */

      delete req.session.userSub;
      delete req.session.xOAuthState;
      delete req.session.xCodeVerifier;
      delete req.session.xCodeChallenge;

      /* =========================
         SUCCESS
      ========================= */

      return res.redirect(
        getFrontendRedirect({

          social: "x",

          verified: "true",

          username:
            user.username || "",

          displayName:
            user.name || "",

          profileImage:
            user.profile_image_url || "",

          verifiedBadge:
            user.verified || false,

          description:
            user.description || "",

          followers:
            user.public_metrics?.followers_count || 0,

          following:
            user.public_metrics?.following_count || 0,

          tweets:
            user.public_metrics?.tweet_count || 0,

        })
      );

    } catch (err) {

      console.error(
        "❌ X CALLBACK ERROR:",
        err
      );

      return redirectFailure(
        res,
        "x_callback_failed"
      );

    }

  }
);

export default router;