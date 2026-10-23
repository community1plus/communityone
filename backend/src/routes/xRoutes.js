import express from "express";
import crypto from "crypto";
import pkceChallenge from "pkce-challenge";

import authMiddleware
  from "../../middleware/authMiddleware.js";

import {
  patchProfileService,
} from "../../services/profileService.js";

const router = express.Router();

/* =========================
   X CONFIG
========================= */

const X_AUTH_URL =
  "https://x.com/i/oauth2/authorize";

const X_TOKEN_URL =
  "https://api.x.com/2/oauth2/token";

const X_ME_URL =
  "https://api.x.com/2/users/me";

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
   SESSION SAVE
========================= */

function saveSession(req) {

  return new Promise(
    (resolve, reject) => {

      req.session.save(
        (err) => {

          if (err) {
            reject(err);
            return;
          }

          resolve();

        }
      );

    }
  );
}

/* =========================
   CLEAN OAUTH SESSION
========================= */

async function destroyOAuthSession(req) {

  delete req.session.userId;

  delete req.session.xOAuthState;

  delete req.session.xCodeVerifier;

  delete req.session.xCodeChallenge;

  await saveSession(req);
}

/* =========================
   BEGIN OAUTH
========================= */

router.post(
  "/begin",
  authMiddleware,
  async (req, res) => {

    try {

      console.log(
        "=== X BEGIN ==="
      );

      if (!validateEnv(res)) {
        return;
      }

      const userId =
        req.user?.userId;

      if (!userId) {

        return res.status(401).json({
          error: "unauthorized",
        });

      }

      /* =========================
         GENERATE PKCE
      ========================= */

      const {
        code_verifier,
        code_challenge,
      } = await pkceChallenge();

      /* =========================
         GENERATE STATE
      ========================= */

      const state =
        crypto.randomUUID();

      /* =========================
         SAVE SESSION
      ========================= */

      req.session.userId =
        userId;

      req.session.xOAuthState =
        state;

      req.session.xCodeVerifier =
        code_verifier;

      req.session.xCodeChallenge =
        code_challenge;

      await saveSession(req);

      console.log(
        "📘 X OAUTH BEGIN:",
        {
          userId,
          sessionId:
            req.sessionID,
        }
      );

      return res.status(200).json({
        success: true,
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
  async (req, res) => {

    try {

      console.log(
        "=== X START ==="
      );

      if (!validateEnv(res)) {
        return;
      }

      const userId =
        req.session?.userId;

      const state =
        req.session?.xOAuthState;

      const codeChallenge =
        req.session?.xCodeChallenge;

      /* =========================
         SESSION VALIDATION
      ========================= */

      if (
        !userId ||
        !state ||
        !codeChallenge
      ) {

        console.error(
          "❌ X SESSION MISSING:",
          {
            sessionId:
              req.sessionID,

            hasUserId:
              Boolean(userId),

            hasState:
              Boolean(state),

            hasCodeChallenge:
              Boolean(codeChallenge),
          }
        );

        return redirectFailure(
          res,
          "x_session_missing"
        );

      }

      /* =========================
         AUTHORIZE URL
      ========================= */

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
        "📘 X OAUTH START:",
        {
          userId,
          sessionId:
            req.sessionID,
        }
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

      console.log(
        "=== X CALLBACK ==="
      );

      if (!validateEnv(res)) {
        return;
      }

      const {
        code,
        error,
        error_description,
        state,
      } = req.query;

      const userId =
        req.session?.userId;

      const sessionState =
        req.session?.xOAuthState;

      const codeVerifier =
        req.session?.xCodeVerifier;

      /* =========================
         SESSION VALIDATION
      ========================= */

      if (!userId) {

        return redirectFailure(
          res,
          "x_session_user_missing"
        );

      }

      if (!sessionState) {

        return redirectFailure(
          res,
          "x_session_state_missing"
        );

      }

      if (!codeVerifier) {

        return redirectFailure(
          res,
          "x_code_verifier_missing"
        );

      }

      /* =========================
         OAUTH ERROR
      ========================= */

      if (error) {

        console.error(
          "❌ X OAUTH ERROR:",
          {
            error,
            error_description,
          }
        );

        await destroyOAuthSession(
          req
        );

        return redirectFailure(
          res,
          String(error)
        );

      }

      /* =========================
         STATE VALIDATION
      ========================= */

      if (
        state !== sessionState
      ) {

        console.error(
          "❌ X STATE MISMATCH"
        );

        await destroyOAuthSession(
          req
        );

        return redirectFailure(
          res,
          "x_state_mismatch"
        );

      }

      /* =========================
         AUTHORIZATION CODE
      ========================= */

      if (!code) {

        await destroyOAuthSession(
          req
        );

        return redirectFailure(
          res,
          "missing_x_code"
        );

      }

      /* =========================
         TOKEN EXCHANGE
      ========================= */

      const tokenBody =
        new URLSearchParams({

          grant_type:
            "authorization_code",

          code,

          redirect_uri:
            process.env.X_REDIRECT_URI,

          code_verifier:
            codeVerifier,

        });

      /*
       * X confidential clients use
       * HTTP Basic authentication
       * with client_id:client_secret.
       */

      const basicCredentials =
        Buffer
          .from(
            `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
          )
          .toString("base64");

      const tokenResponse =
        await fetch(
          X_TOKEN_URL,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/x-www-form-urlencoded",

              Authorization:
                `Basic ${basicCredentials}`,

            },

            body:
              tokenBody,

          }
        );

      const tokenData =
        await tokenResponse.json();

      /*
       * NEVER log access_token or refresh_token.
       */

      if (
        !tokenResponse.ok ||
        !tokenData?.access_token
      ) {

        console.error(
          "❌ X TOKEN EXCHANGE FAILED:",
          {
            status:
              tokenResponse.status,

            error:
              tokenData?.error,

            error_description:
              tokenData?.error_description,
          }
        );

        await destroyOAuthSession(
          req
        );

        return redirectFailure(
          res,
          "x_token_exchange_failed"
        );

      }

      const accessToken =
        tokenData.access_token;

      /* =========================
         GET AUTHENTICATED X USER
      ========================= */

      const profileUrl =
        new URL(
          X_ME_URL
        );

      profileUrl.searchParams.set(
        "user.fields",
        [
          "id",
          "name",
          "username",
          "profile_image_url",
          "verified",
          "description",
          "public_metrics",
        ].join(",")
      );

      const meResponse =
        await fetch(
          profileUrl,
          {

            headers: {

              Authorization:
                `Bearer ${accessToken}`,

            },

          }
        );

      const meData =
        await meResponse.json();

      if (
        !meResponse.ok ||
        !meData?.data?.id
      ) {

        console.error(
          "❌ X PROFILE LOOKUP FAILED:",
          {
            status:
              meResponse.status,

            errors:
              meData?.errors,
          }
        );

        await destroyOAuthSession(
          req
        );

        return redirectFailure(
          res,
          "x_profile_lookup_failed"
        );

      }

      const user =
        meData.data;

      /* =========================
         BUILD X PROFILE
      ========================= */

      const xProfile = {

        verified:
          true,

        verifiedAt:
          new Date().toISOString(),

        providerId:
          user.id || "",

        username:
          user.username || "",

        displayName:
          user.name || "",

        profileImage:
          user.profile_image_url || "",

        verifiedBadge:
          Boolean(
            user.verified
          ),

        description:
          user.description || "",

        followersCount:
          user.public_metrics
            ?.followers_count ?? 0,

        followingCount:
          user.public_metrics
            ?.following_count ?? 0,

        tweetCount:
          user.public_metrics
            ?.tweet_count ?? 0,

      };

      /* =========================
         PERSIST PROFILE
      ========================= */

      await patchProfileService({

        userId,

        body: {

          profile: {

            social: {

              x:
                xProfile,

            },

          },

        },

        req,

      });

      console.log(
        "✅ X VERIFIED:",
        {
          userId,

          providerId:
            xProfile.providerId,

          username:
            xProfile.username,
        }
      );

      /* =========================
         CLEAN SESSION
      ========================= */

      await destroyOAuthSession(
        req
      );

      /* =========================
         SUCCESS
      ========================= */

      return res.redirect(

        getFrontendRedirect({

          social:
            "x",

          verified:
            "true",

          username:
            xProfile.username,

        })

      );

    } catch (err) {

      console.error(
        "❌ X CALLBACK ERROR:",
        err
      );

      try {

        await destroyOAuthSession(
          req
        );

      } catch {
        // Ignore cleanup failure.
      }

      return redirectFailure(
        res,
        "x_callback_failed"
      );

    }

  }
);

/* =========================
   DISCONNECT
========================= */

router.delete(
  "/disconnect",
  authMiddleware,
  async (req, res) => {

    try {

      const userId =
        req.user?.userId;

      if (!userId) {

        return res.status(401).json({
          error: "unauthorized",
        });

      }

      await patchProfileService({

        userId,

        body: {

          profile: {

            social: {

              x:
                null,

            },

          },

        },

        req,

      });

      console.log(
        "✅ X DISCONNECTED:",
        userId
      );

      return res.status(200).json({

        success:
          true,

      });

    } catch (err) {

      console.error(
        "❌ X DISCONNECT ERROR:",
        err
      );

      return res.status(500).json({

        error:
          "x_disconnect_failed",

      });

    }

  }
);
//
export default router;