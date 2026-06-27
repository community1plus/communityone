import express from "express";
import crypto from "crypto";
import pkceChallenge from "pkce-challenge";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   X CONFIG
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

  return `${baseUrl}/communityplus/profile?${new URLSearchParams(params)}`;
}

/* =========================
   FAILURE
========================= */

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
   ENV VALIDATION
========================= */

function validateEnv(res) {

  if (
    !process.env.X_CLIENT_ID ||
    !process.env.X_CLIENT_SECRET ||
    !process.env.X_REDIRECT_URI
  ) {

    redirectFailure(
      res,
      "x_oauth_not_configured"
    );

    return false;
  }

  return true;
}

/* =========================
   SESSION VALIDATION
========================= */

function validateSession(req, res) {

  const valid =

    req.session.userSub &&
    req.session.xOAuthState &&
    req.session.xCodeVerifier &&
    req.session.xCodeChallenge;

  if (!valid) {

    console.error(
      "❌ Missing OAuth session",
      {
        id: req.sessionID,
        session: req.session,
      }
    );

    redirectFailure(
      res,
      "missing_user_session"
    );

    return false;

  }

  return true;

}

/* =========================
   CLEAN SESSION
========================= */

function destroyOAuthSession(req) {

  delete req.session.userSub;

  delete req.session.xOAuthState;

  delete req.session.xCodeVerifier;

  delete req.session.xCodeChallenge;

}
/* =========================
   BEGIN OAUTH
========================= */

router.post(
  "/begin",
  authMiddleware,
  async (req, res) => {

    try {

      console.log("=== X BEGIN ===");

      if (!validateEnv(res)) {
        return;
      }

      const {
        code_verifier,
        code_challenge,
      } = await pkceChallenge();

      req.session.userSub =
        req.user.sub;

      req.session.xOAuthState =
        crypto.randomUUID();

      req.session.xCodeVerifier =
        code_verifier;

      req.session.xCodeChallenge =
        code_challenge;

      console.log(
        "Saving X session",
        {
          sessionId:
            req.sessionID,

          userSub:
            req.session.userSub,
        }
      );

      req.session.save((err) => {

        if (err) {

          console.error(
            "Session save failed",
            err
          );

          return res.status(500).json({

            error:
              "Session save failed",

          });

        }

        console.log(
          "✔ X session saved"
        );

        return res.json({

          ok: true,

        });

      });

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
  (req, res) => {

    try {

      console.log("=== X START ===");

      console.log(
        "Session ID:",
        req.sessionID
      );

      if (!validateEnv(res)) {
        return;
      }

      if (!validateSession(req, res)) {
        return;
      }

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

          state:
            req.session.xOAuthState,

          code_challenge:
            req.session.xCodeChallenge,

          code_challenge_method:
            "S256",

        });

      const authUrl =
        `${X_AUTH_URL}?${params.toString()}`;

      console.log(
        "Redirecting to X..."
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

      console.log("=== X CALLBACK ===");

      if (!validateEnv(res)) {
        return;
      }

      if (!validateSession(req, res)) {
        return;
      }

      const {
        code,
        error,
        state,
      } = req.query;

      if (error) {

        console.error(
          "❌ X OAUTH ERROR:",
          error
        );

        destroyOAuthSession(req);

        return redirectFailure(
          res,
          String(error)
        );

      }

      if (!code) {

        destroyOAuthSession(req);

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

        destroyOAuthSession(req);

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
        "X TOKEN:",
        tokenData
      );

      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {

        destroyOAuthSession(req);

        return redirectFailure(
          res,
          "x_token_exchange_failed"
        );

      }

      /* =========================
         GET USER PROFILE
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
        "X PROFILE:",
        meData
      );

      if (
        !meResponse.ok ||
        !meData.data
      ) {

        destroyOAuthSession(req);

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

      destroyOAuthSession(req);

      req.session.save(() => {

        return res.redirect(

          getFrontendRedirect({

            social: "x",

            verified: "true",

            providerId:
              user.id || "",

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

      });

    } catch (err) {

      console.error(
        "❌ X CALLBACK ERROR:",
        err
      );

      destroyOAuthSession(req);

      return redirectFailure(
        res,
        "x_callback_failed"
      );

    }

  }
);

export default router;