import express from "express";
import crypto from "crypto";

import authMiddleware from "../../middleware/authMiddleware.js";

import {
  patchProfileService,
} from "../../services/profileService.js";

const router = express.Router();

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token";

const YOUTUBE_CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels";


// ============================================================
// FRONTEND REDIRECT
// ============================================================

function getFrontendRedirect(params = {}) {
  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://main.d1ss8rtrtimogr.amplifyapp.com";

  const query = new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}


// ============================================================
// FAILURE REDIRECT
// ============================================================

function redirectFailure(
  res,
  reason = "youtube_verification_failed"
) {
  return res.redirect(
    getFrontendRedirect({
      social: "youtube",
      verified: "false",
      reason,
    })
  );
}


// ============================================================
// OAUTH CONFIGURATION CHECK
// ============================================================

function isOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  );
}


// ============================================================
// START GOOGLE OAUTH
// ============================================================

router.get("/start", async (req, res) => {
  try {
    console.log("=== YOUTUBE START ===");

    console.log(
      "Session ID:",
      req.sessionID
    );

    console.log(
      "YouTube OAuth session:",
      {
        userId:
          req.session?.userId,

        ytOAuthState:
          req.session?.ytOAuthState,
      }
    );


    // --------------------------------------------------------
    // Validate OAuth configuration
    // --------------------------------------------------------

    if (!isOAuthConfigured()) {
      console.error(
        "❌ YOUTUBE START: OAuth configuration missing"
      );

      return redirectFailure(
        res,
        "youtube_oauth_not_configured"
      );
    }


    // --------------------------------------------------------
    // Resolve OAuth state
    // --------------------------------------------------------

    const state =
      req.session?.ytOAuthState;

    if (!state) {
      console.error(
        "❌ YOUTUBE START: Missing OAuth state"
      );

      return redirectFailure(
        res,
        "youtube_oauth_state_missing"
      );
    }


    // --------------------------------------------------------
    // Build Google OAuth URL
    // --------------------------------------------------------

    const params = new URLSearchParams({
      client_id:
        process.env.GOOGLE_CLIENT_ID,

      redirect_uri:
        process.env.GOOGLE_REDIRECT_URI,

      response_type:
        "code",

      state,

      access_type:
        "offline",

      prompt:
        "consent",

      scope:
        "https://www.googleapis.com/auth/youtube.readonly openid email profile",
    });


    console.log(
      "✅ YOUTUBE OAUTH URL CREATED"
    );


    return res.redirect(
      `${GOOGLE_AUTH_URL}?${params.toString()}`
    );

  } catch (err) {

    console.error(
      "❌ YOUTUBE START ERROR:",
      err
    );

    return redirectFailure(
      res,
      "youtube_start_failed"
    );
  }
});


// ============================================================
// BEGIN YOUTUBE VERIFICATION
// ============================================================

router.post(
  "/begin",
  authMiddleware,
  (req, res) => {

    console.log("=== YOUTUBE BEGIN ===");

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


    // --------------------------------------------------------
    // Resolve canonical internal user
    // --------------------------------------------------------

    const userId =
      req.user?.userId;

    if (!userId) {

      console.error(
        "❌ YOUTUBE BEGIN: Missing internal userId"
      );

      return res.status(401).json({
        error:
          "Authenticated user ID missing",
      });
    }


    // --------------------------------------------------------
    // Create OAuth state
    // --------------------------------------------------------

    const oauthState =
      crypto.randomUUID();


    // --------------------------------------------------------
    // Store OAuth transaction in session
    // --------------------------------------------------------

    req.session.userId =
      userId;

    req.session.ytOAuthState =
      oauthState;


    console.log(
      "Saving YouTube OAuth session:",
      {
        sessionId:
          req.sessionID,

        userId:
          req.session.userId,

        ytOAuthState:
          req.session.ytOAuthState,
      }
    );


    // --------------------------------------------------------
    // Explicitly persist before OAuth redirect
    // --------------------------------------------------------

    req.session.save((err) => {

      if (err) {

        console.error(
          "❌ YOUTUBE SESSION SAVE ERROR:",
          err
        );

        return res.status(500).json({
          error:
            "Session save failed",
        });
      }


      console.log(
        "✅ YOUTUBE SESSION SAVED"
      );


      return res.json({
        ok: true,
      });

    });
  }
);


// ============================================================
// YOUTUBE CALLBACK
// ============================================================

router.get(
  "/callback",
  async (req, res) => {

    console.log("=== YOUTUBE CALLBACK ===");

    console.log(
      "Session ID:",
      req.sessionID
    );

    console.log(
      "Callback query:",
      req.query
    );

    console.log(
      "YouTube OAuth session:",
      {
        userId:
          req.session?.userId,

        ytOAuthState:
          req.session?.ytOAuthState,
      }
    );


    // --------------------------------------------------------
    // Resolve user from OAuth session
    // --------------------------------------------------------

    const userId =
      req.session?.userId;

    if (!userId) {

      console.error(
        "❌ YOUTUBE CALLBACK: Missing userId in session"
      );

      return redirectFailure(
        res,
        "missing_user_session"
      );
    }


    try {

      // ======================================================
      // READ CALLBACK PARAMETERS
      // ======================================================

      const code =
        req.query.code;

      const state =
        req.query.state;

      const oauthError =
        req.query.error;


      // ======================================================
      // GOOGLE OAUTH ERROR
      // ======================================================

      if (oauthError) {

        console.error(
          "❌ YOUTUBE GOOGLE OAUTH ERROR:",
          oauthError
        );

        return redirectFailure(
          res,
          String(oauthError)
        );
      }


      // ======================================================
      // VALIDATE STATE
      // ======================================================

      if (
        !state ||
        state !== req.session.ytOAuthState
      ) {

        console.error(
          "❌ YOUTUBE STATE MISMATCH:",
          {
            receivedState:
              state,

            sessionState:
              req.session.ytOAuthState,
          }
        );

        return redirectFailure(
          res,
          "youtube_state_mismatch"
        );
      }


      // ======================================================
      // VALIDATE AUTHORIZATION CODE
      // ======================================================

      if (!code) {

        console.error(
          "❌ YOUTUBE CALLBACK: Missing authorization code"
        );

        return redirectFailure(
          res,
          "missing_youtube_code"
        );
      }


      // ======================================================
      // VALIDATE GOOGLE CONFIGURATION
      // ======================================================

      if (!isOAuthConfigured()) {

        console.error(
          "❌ YOUTUBE CALLBACK: OAuth configuration missing"
        );

        return redirectFailure(
          res,
          "youtube_oauth_not_configured"
        );
      }


      // ======================================================
      // EXCHANGE AUTHORIZATION CODE
      // ======================================================

      console.log(
        "=== YOUTUBE TOKEN EXCHANGE ==="
      );

      const tokenResponse =
        await fetch(
          GOOGLE_TOKEN_URL,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              new URLSearchParams({
                code,

                client_id:
                  process.env.GOOGLE_CLIENT_ID,

                client_secret:
                  process.env.GOOGLE_CLIENT_SECRET,

                redirect_uri:
                  process.env.GOOGLE_REDIRECT_URI,

                grant_type:
                  "authorization_code",
              }),
          }
        );


      const tokenData =
        await tokenResponse.json();


      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {

        console.error(
          "❌ YOUTUBE TOKEN ERROR:",
          tokenData
        );

        return redirectFailure(
          res,
          "youtube_token_exchange_failed"
        );
      }


      console.log(
        "✅ YOUTUBE TOKEN EXCHANGE SUCCESS"
      );


      // ======================================================
      // FETCH YOUTUBE CHANNEL
      // ======================================================

      console.log(
        "=== YOUTUBE CHANNEL LOOKUP ==="
      );

      const channelResponse =
        await fetch(
          `${YOUTUBE_CHANNELS_URL}?part=snippet,statistics,brandingSettings&mine=true`,
          {
            headers: {
              Authorization:
                `Bearer ${tokenData.access_token}`,
            },
          }
        );


      const channelData =
        await channelResponse.json();


      if (!channelResponse.ok) {

        console.error(
          "❌ YOUTUBE CHANNEL ERROR:",
          channelData
        );

        return redirectFailure(
          res,
          "youtube_channel_lookup_failed"
        );
      }


      const channel =
        channelData?.items?.[0];


      if (!channel) {

        console.error(
          "❌ YOUTUBE: No channel found"
        );

        return redirectFailure(
          res,
          "no_youtube_channel_found"
        );
      }


      // ======================================================
      // EXTRACT CHANNEL DATA
      // ======================================================

      const channelId =
        channel.id;

      const channelTitle =
        channel.snippet?.title ||
        "YouTube channel";

      const channelDescription =
        channel.snippet?.description ||
        "";

      const customUrl =
        channel.snippet?.customUrl ||
        "";

      const thumbnail =
        channel.snippet?.thumbnails?.high?.url ||
        channel.snippet?.thumbnails?.medium?.url ||
        channel.snippet?.thumbnails?.default?.url ||
        "";

      const subscriberCount =
        channel.statistics?.subscriberCount ||
        "";

      const videoCount =
        channel.statistics?.videoCount ||
        "";

      const viewCount =
        channel.statistics?.viewCount ||
        "";

      const country =
        channel.snippet?.country ||
        "";

      const publishedAt =
        channel.snippet?.publishedAt ||
        "";


      console.log(
        "✅ YOUTUBE CHANNEL FOUND:",
        {
          userId,
          channelId,
          channelTitle,
        }
      );


      // ======================================================
      // PERSIST YOUTUBE VERIFICATION
      // ======================================================

      console.log(
        "=== SAVING YOUTUBE PROFILE ==="
      );


      await patchProfileService({
        userId,

        body: {
          profile: {
            social: {
              youtube: {
                verified:
                  true,

                verifiedAt:
                  new Date().toISOString(),

                channelId,

                channelTitle,

                channelDescription,

                profilePicture:
                  thumbnail,

                subscriberCount,

                videoCount,

                viewCount,

                customUrl,

                country,

                publishedAt,
              },
            },
          },
        },

        req,
      });


      console.log(
        "✅ YOUTUBE PROFILE SAVED"
      );


      // ======================================================
      // CLEAN UP OAUTH SESSION
      // ======================================================

      delete req.session.userId;

      delete req.session.ytOAuthState;


      // ======================================================
      // SAVE SESSION CLEANUP
      // ======================================================

      req.session.save((err) => {

        if (err) {

          console.error(
            "❌ YOUTUBE SESSION CLEANUP ERROR:",
            err
          );

          return redirectFailure(
            res,
            "youtube_session_cleanup_failed"
          );
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        console.log(
          "✅ YOUTUBE VERIFICATION SUCCESS"
        );

        console.log(
          "Redirecting to frontend:",
          {
            userId,
            channelId,
            channelTitle,
          }
        );


        return res.redirect(
          getFrontendRedirect({
            social:
              "youtube",

            verified:
              "true",
          })
        );

      });

    } catch (err) {

      console.error(
        "❌ YOUTUBE CALLBACK ERROR:",
        err
      );

      return redirectFailure(
        res,
        "youtube_callback_failed"
      );
    }
  }
);

// ======================================================
// DISCONNECT YOUTUBE
// ======================================================

router.delete(
  "/disconnect",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: "Authenticated user not resolved",
        });
      }

      console.log(
        "🔌 DISCONNECTING YOUTUBE:",
        {
          userId,
        }
      );

      await patchProfileService({
        userId,
        body: {
          profile: {
            social: {
              youtube: null,
            },
          },
        },
        req,
      });

      console.log(
        "✅ YOUTUBE DISCONNECTED:",
        {
          userId,
        }
      );

      return res.status(200).json({
        success: true,
        provider: "youtube",
      });

    } catch (err) {
      console.error(
        "❌ YOUTUBE DISCONNECT ERROR:",
        err
      );

      return res.status(500).json({
        error: "Failed to disconnect YouTube",
      });
    }
  }
);

export default router;