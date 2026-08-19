import express from "express";
import crypto from "crypto";

import authMiddleware from "../../middleware/authMiddleware.js";

import {
  updateFacebookProfile,
  disconnectFacebook,
} from "../../services/profileService.js";


const router =
  express.Router();


/* =====================================================
   FACEBOOK GRAPH CONFIG
===================================================== */

const FB_AUTH_URL =
  "https://www.facebook.com/v25.0/dialog/oauth";

const FB_TOKEN_URL =
  "https://graph.facebook.com/v25.0/oauth/access_token";

const FB_GRAPH_URL =
  "https://graph.facebook.com/v25.0";


/* =====================================================
   FRONTEND REDIRECT
===================================================== */

function getFrontendRedirect(
  params = {}
) {

  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://develop.d1ss8rtrtimogr.amplifyapp.com";


  const query =
    new URLSearchParams(
      params
    );


  return (
    `${baseUrl}` +
    `/communityplus/profile?` +
    `${query.toString()}`
  );

}


/* =====================================================
   FAILURE REDIRECT
===================================================== */

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

      social:
        "facebook",

      verified:
        "false",

      reason,

    })
  );

}


/* =====================================================
   ROUTER DEBUG
===================================================== */

router.use(
  (req, res, next) => {

    console.log(
      "FACEBOOK ROUTER:",
      req.method,
      req.originalUrl
    );

    next();

  }
);


/* =====================================================
   BEGIN FACEBOOK VERIFICATION
===================================================== */

/*
 * This endpoint is called by the
 * authenticated Community One client.
 *
 * Store the PLATFORM userId in the
 * OAuth session.
 *
 * Do not store Cognito sub here.
 */

router.post(
  "/begin",
  authMiddleware,
  (req, res) => {

    const userId =
      req.user?.userId;


    if (!userId) {

      console.error(
        "❌ FACEBOOK BEGIN: missing Community One userId"
      );

      return res.status(401).json({

        error:
          "Authentication required.",

      });

    }


    /*
     * Create OAuth state.
     */

    req.session.userId =
      userId;

    req.session.fbOAuthState =
      crypto.randomUUID();


    console.log(
      "Facebook verification beginning for:",
      userId
    );


    /*
     * Persist session before
     * returning to the browser.
     */

    req.session.save(
      (err) => {

        if (err) {

          console.error(
            "❌ FACEBOOK SESSION SAVE FAILED:",
            err
          );

          return res.status(500).json({

            error:
              "Session save failed",

          });

        }


        return res.json({

          ok:
            true,

        });

      }
    );

  }
);


/* =====================================================
   START FACEBOOK OAUTH
===================================================== */

router.get(
  "/start",
  (req, res) => {

    try {

      const userId =
        req.session?.userId;

      const state =
        req.session?.fbOAuthState;


      console.log(
        "=== FACEBOOK START ==="
      );

      console.log(
        "Session ID:",
        req.sessionID
      );

      console.log(
        "Community One userId:",
        userId
      );


      if (!userId) {

        return redirectFailure(
          res,
          "missing_user_session"
        );

      }


      if (!state) {

        return redirectFailure(
          res,
          "missing_oauth_state"
        );

      }


      if (
        !process.env.FACEBOOK_APP_ID ||
        !process.env.FACEBOOK_REDIRECT_URI
      ) {

        return redirectFailure(
          res,
          "facebook_oauth_not_configured"
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


      /*
       * Do not log the entire URL in
       * production unnecessarily.
       */

      console.log(
        "Facebook OAuth URL generated."
      );


      return res.redirect(
        authUrl
      );

    } catch (err) {

      console.error(
        "❌ FACEBOOK START ERROR:",
        {
          message:
            err.message,

          stack:
            err.stack,
        }
      );


      return redirectFailure(
        res,
        "facebook_start_failed"
      );

    }

  }
);


/* =====================================================
   FACEBOOK CALLBACK
===================================================== */

router.get(
  "/callback",
  async (req, res) => {

    try {

      const {
        code,
        error,
        error_reason,
        error_description,
        state,
      } = req.query;


      /*
       * Recover the Community One
       * platform identity from the
       * server-side OAuth session.
       */

      const userId =
        req.session?.userId;


      console.log(
        "========================================"
      );

      console.log(
        "FACEBOOK CALLBACK"
      );

      console.log(
        "Session ID:",
        req.sessionID
      );

      console.log(
        "Community One userId:",
        userId
      );

      console.log(
        "========================================"
      );


      if (!userId) {

        return redirectFailure(
          res,
          "missing_user_session"
        );

      }


      /* =================================================
         FACEBOOK OAUTH ERROR
      ================================================= */

      if (error) {

        console.error(
          "❌ FACEBOOK OAUTH ERROR:",
          {
            error,
            error_reason,
            error_description,
          }
        );


        return redirectFailure(
          res,
          error_reason ||
            error_description ||
            "facebook_oauth_failed"
        );

      }


      /* =================================================
         CODE
      ================================================= */

      if (!code) {

        return redirectFailure(
          res,
          "missing_facebook_code"
        );

      }


      /* =================================================
         STATE VALIDATION
      ================================================= */

      const expectedState =
        req.session?.fbOAuthState;


      if (
        !expectedState ||
        state !== expectedState
      ) {

        console.error(
          "❌ FACEBOOK STATE MISMATCH"
        );


        return redirectFailure(
          res,
          "facebook_state_mismatch"
        );

      }


      /* =================================================
         ENVIRONMENT
      ================================================= */

      if (
        !process.env.FACEBOOK_APP_ID ||
        !process.env.FACEBOOK_APP_SECRET ||
        !process.env.FACEBOOK_REDIRECT_URI
      ) {

        return redirectFailure(
          res,
          "facebook_oauth_not_configured"
        );

      }


      /* =================================================
         TOKEN EXCHANGE
      ================================================= */

      const tokenParams =
        new URLSearchParams({

          client_id:
            process.env.FACEBOOK_APP_ID,

          client_secret:
            process.env.FACEBOOK_APP_SECRET,

          redirect_uri:
            process.env.FACEBOOK_REDIRECT_URI,

          code,

        });


      const tokenUrl =
        `${FB_TOKEN_URL}?` +
        `${tokenParams.toString()}`;


      const tokenResponse =
        await fetch(
          tokenUrl
        );


      const tokenData =
        await tokenResponse.json();


      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {

        console.error(
          "❌ FACEBOOK TOKEN EXCHANGE FAILED:",
          {
            status:
              tokenResponse.status,

            error:
              tokenData?.error,
          }
        );


        return redirectFailure(
          res,
          "facebook_token_exchange_failed"
        );

      }


      const accessToken =
        tokenData.access_token;


      /* =================================================
         FACEBOOK PROFILE
      ================================================= */

      const profileUrl =
        `${FB_GRAPH_URL}/me` +
        `?fields=id,name,email,` +
        `picture.width(400).height(400)` +
        `&access_token=${encodeURIComponent(
          accessToken
        )}`;


      const profileResponse =
        await fetch(
          profileUrl
        );


      const profileData =
        await profileResponse.json();


      if (
        !profileResponse.ok ||
        !profileData.id
      ) {

        console.error(
          "❌ FACEBOOK PROFILE LOOKUP FAILED:",
          {
            status:
              profileResponse.status,

            error:
              profileData?.error,
          }
        );


        return redirectFailure(
          res,
          "facebook_profile_lookup_failed"
        );

      }


      /* =================================================
         FACEBOOK PAGES
      ================================================= */

      const pagesUrl =
        `${FB_GRAPH_URL}/me/accounts` +
        `?access_token=${encodeURIComponent(
          accessToken
        )}`;


      const pagesResponse =
        await fetch(
          pagesUrl
        );


      const pagesData =
        await pagesResponse.json();


      /*
       * Page lookup should not prevent
       * Facebook verification if the
       * profile itself succeeded.
       */

      const pageCount =
        pagesResponse.ok
          ? (
              pagesData?.data?.length ||
              0
            )
          : 0;


      if (!pagesResponse.ok) {

        console.warn(
          "⚠️ FACEBOOK PAGE LOOKUP FAILED:",
          {
            status:
              pagesResponse.status,

            error:
              pagesData?.error,
          }
        );

      }


      /* =================================================
         BUILD FACEBOOK SOCIAL STATE
      ================================================= */

      const facebook = {

        verified:
          true,

        verifiedAt:
          new Date().toISOString(),

        providerId:
          profileData.id,

        accountName:
          profileData.name ||
          null,

        email:
          profileData.email ||
          null,

        profilePicture:
          profileData
            .picture
            ?.data
            ?.url ||
          null,

        pageCount,

      };


      console.log(
        "Facebook verification resolved:",
        {
          providerId:
            facebook.providerId,

          accountName:
            facebook.accountName,

          pageCount:
            facebook.pageCount,
        }
      );


      /* =================================================
         PERSIST FACEBOOK STATE
      ================================================= */

      const saved =
        await updateFacebookProfile({

          userId,

          facebook,

        });


      console.log(
        "✅ FACEBOOK PROFILE SAVED:",
        {
          userId,

          version:
            saved.version,

          verified:
            saved.profile?.social
              ?.facebook
              ?.verified,
        }
      );


      /* =================================================
         CLEAN OAUTH SESSION
      ================================================= */

      delete req.session.fbOAuthState;

      delete req.session.userId;


      req.session.save(
        (err) => {

          if (err) {

            console.error(
              "⚠️ FACEBOOK SESSION CLEANUP FAILED:",
              err
            );

          }


          return res.redirect(
            getFrontendRedirect({

              social:
                "facebook",

              verified:
                "true",

            })
          );

        }
      );

    } catch (err) {

      console.error(
        "❌ FACEBOOK CALLBACK ERROR:",
        {
          message:
            err.message,

          stack:
            err.stack,
        }
      );


      return redirectFailure(
        res,
        "facebook_callback_failed"
      );

    }

  }
);


/* =====================================================
   DISCONNECT FACEBOOK
===================================================== */

router.delete(
  "/disconnect",
  authMiddleware,
  async (req, res) => {

    try {

      const userId =
        req.user?.userId;


      if (!userId) {

        return res.status(401).json({

          error:
            "Authentication required.",

        });

      }


      console.log(
        "Disconnecting Facebook for:",
        userId
      );


      const result =
        await disconnectFacebook({

          userId,

        });


      console.log(
        "✅ FACEBOOK DISCONNECTED:",
        {
          userId,

          version:
            result.version,
        }
      );


      return res.status(200).json({

        ok:
          true,

        profile:
          result.profile,

        version:
          result.version,

      });

    } catch (err) {

      console.error(
        "❌ FACEBOOK DISCONNECT FAILED:",
        {
          message:
            err.message,

          stack:
            err.stack,
        }
      );


      if (
        err.message ===
        "Profile not found"
      ) {

        return res.status(404).json({

          error:
            "Profile not found",

        });

      }


      return res.status(500).json({

        error:
          "facebook_disconnect_failed",

        detail:
          err.message,

      });

    }

  }
);


export default router;