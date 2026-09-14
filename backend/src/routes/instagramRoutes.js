import express from "express";
import crypto from "crypto";

import authMiddleware from "../../middleware/authMiddleware.js";
import { patchProfileService } from "../services/profileService.js";

const router = express.Router();

/* =========================
   INSTAGRAM / META GRAPH API
========================= */

const FB_OAUTH_URL =
  "https://www.facebook.com/v25.0/dialog/oauth";

const FB_TOKEN_URL =
  "https://graph.facebook.com/v25.0/oauth/access_token";

const FB_GRAPH_URL =
  "https://graph.facebook.com/v25.0";

/* =========================
   FRONTEND REDIRECT
========================= */

function getFrontendRedirect(params = {}) {
  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://develop.d1ss8rtrtimogr.amplifyapp.com";

  const query = new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}

/* =========================
   FAILURE REDIRECT
========================= */

function redirectFailure(
  res,
  reason = "instagram_verification_failed"
) {
  console.error(
    "❌ INSTAGRAM FAILURE:",
    reason
  );

  return res.redirect(
    getFrontendRedirect({
      social: "instagram",
      verified: "false",
      reason,
    })
  );
}

/* =========================
   BEGIN INSTAGRAM VERIFICATION
========================= */

router.post(
  "/begin",
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

      const state =
        crypto.randomUUID();

      req.session.userId =
        userId;

      req.session.igOAuthState =
        state;

      await new Promise(
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

      console.log(
        "📸 INSTAGRAM OAUTH BEGIN:",
        {
          userId,
          sessionId: req.sessionID,
        }
      );

      return res.status(200).json({
        success: true,
      });

    } catch (err) {
      console.error(
        "❌ INSTAGRAM BEGIN ERROR:",
        err
      );

      return res.status(500).json({
        error:
          "instagram_begin_failed",
      });
    }
  }
);

/* =========================
   START INSTAGRAM OAUTH
========================= */

router.get(
  "/start",
  async (req, res) => {
    try {
      if (
        !process.env.INSTAGRAM_APP_ID ||
        !process.env.INSTAGRAM_REDIRECT_URI
      ) {
        return redirectFailure(
          res,
          "instagram_oauth_not_configured"
        );
      }

      const userId =
        req.session?.userId;

      const state =
        req.session?.igOAuthState;

      if (!userId || !state) {
        return redirectFailure(
          res,
          "instagram_session_missing"
        );
      }

      const params =
        new URLSearchParams({
          client_id:
            process.env.INSTAGRAM_APP_ID,

          redirect_uri:
            process.env.INSTAGRAM_REDIRECT_URI,

          response_type:
            "code",

          state,

          scope: [
            "instagram_basic",
            "pages_show_list",
            "pages_read_engagement",
            "business_management",
          ].join(","),
        });

      const authUrl =
        `${FB_OAUTH_URL}?${params.toString()}`;

      console.log(
        "📸 INSTAGRAM OAUTH START:",
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
        "❌ INSTAGRAM START ERROR:",
        err
      );

      return redirectFailure(
        res,
        "instagram_start_failed"
      );
    }
  }
);

/* =========================
   INSTAGRAM CALLBACK
========================= */

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

      const sessionUserId =
        req.session?.userId;

      const sessionState =
        req.session?.igOAuthState;

      console.log(
        "📸 INSTAGRAM CALLBACK:",
        {
          hasCode: Boolean(code),
          hasState: Boolean(state),
          hasSessionUser:
            Boolean(sessionUserId),
          hasSessionState:
            Boolean(sessionState),
        }
      );

      /* =========================
         OAUTH ERROR
      ========================= */

      if (error) {
        console.error(
          "❌ INSTAGRAM OAUTH ERROR:",
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
            "instagram_oauth_failed"
        );
      }

      /* =========================
         SESSION VALIDATION
      ========================= */

      if (!sessionUserId) {
        return redirectFailure(
          res,
          "instagram_session_user_missing"
        );
      }

      if (!sessionState) {
        return redirectFailure(
          res,
          "instagram_session_state_missing"
        );
      }

      if (state !== sessionState) {
        console.error(
          "❌ INSTAGRAM STATE MISMATCH"
        );

        return redirectFailure(
          res,
          "instagram_state_mismatch"
        );
      }

      if (!code) {
        return redirectFailure(
          res,
          "missing_instagram_code"
        );
      }

      /* =========================
         ENVIRONMENT
      ========================= */

      if (
        !process.env.INSTAGRAM_APP_ID ||
        !process.env.INSTAGRAM_APP_SECRET ||
        !process.env.INSTAGRAM_REDIRECT_URI
      ) {
        return redirectFailure(
          res,
          "instagram_oauth_not_configured"
        );
      }

      /* =========================
         TOKEN EXCHANGE
      ========================= */

      const tokenParams =
        new URLSearchParams({
          client_id:
            process.env.INSTAGRAM_APP_ID,

          client_secret:
            process.env.INSTAGRAM_APP_SECRET,

          redirect_uri:
            process.env.INSTAGRAM_REDIRECT_URI,

          code,
        });

      const tokenResponse =
        await fetch(
          `${FB_TOKEN_URL}?${tokenParams.toString()}`
        );

      const tokenData =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.access_token
      ) {
        console.error(
          "❌ INSTAGRAM TOKEN EXCHANGE FAILED:",
          {
            status:
              tokenResponse.status,
            error:
              tokenData?.error,
          }
        );

        return redirectFailure(
          res,
          "instagram_token_exchange_failed"
        );
      }

      const accessToken =
        tokenData.access_token;

      /* =========================
         GET FACEBOOK PAGES
      ========================= */

      const pagesUrl =
        new URL(
          `${FB_GRAPH_URL}/me/accounts`
        );

      pagesUrl.searchParams.set(
        "access_token",
        accessToken
      );

      const pagesResponse =
        await fetch(pagesUrl);

      const pagesData =
        await pagesResponse.json();

      if (
        !pagesResponse.ok ||
        !pagesData.data?.length
      ) {
        console.error(
          "❌ INSTAGRAM FACEBOOK PAGES LOOKUP FAILED:",
          {
            status:
              pagesResponse.status,
            error:
              pagesData?.error,
          }
        );

        return redirectFailure(
          res,
          "facebook_pages_lookup_failed"
        );
      }

      /* =========================
         FIND INSTAGRAM BUSINESS ACCOUNT
      ========================= */

      let instagramBusinessId =
        null;

      let selectedPageId =
        null;

      let selectedPageName =
        "";

      for (
        const page of pagesData.data
      ) {
        const pageId =
          page.id;

        const pageUrl =
          new URL(
            `${FB_GRAPH_URL}/${pageId}`
          );

        pageUrl.searchParams.set(
          "fields",
          "id,name,instagram_business_account"
        );

        pageUrl.searchParams.set(
          "access_token",
          accessToken
        );

        const pageResponse =
          await fetch(pageUrl);

        const pageData =
          await pageResponse.json();

        if (
          pageResponse.ok &&
          pageData
            ?.instagram_business_account
            ?.id
        ) {
          instagramBusinessId =
            pageData
              .instagram_business_account
              .id;

          selectedPageId =
            pageId;

          selectedPageName =
            pageData.name || "";

          break;
        }
      }

      if (!instagramBusinessId) {
        return redirectFailure(
          res,
          "instagram_business_account_missing"
        );
      }

      /* =========================
         GET INSTAGRAM PROFILE
      ========================= */

      const profileUrl =
        new URL(
          `${FB_GRAPH_URL}/${instagramBusinessId}`
        );

      profileUrl.searchParams.set(
        "fields",
        [
          "id",
          "username",
          "profile_picture_url",
          "followers_count",
          "follows_count",
          "media_count",
        ].join(",")
      );

      profileUrl.searchParams.set(
        "access_token",
        accessToken
      );

      const profileResponse =
        await fetch(profileUrl);

      const profileData =
        await profileResponse.json();

      if (
        !profileResponse.ok ||
        !profileData?.id
      ) {
        console.error(
          "❌ INSTAGRAM PROFILE LOOKUP FAILED:",
          {
            status:
              profileResponse.status,
            error:
              profileData?.error,
          }
        );

        return redirectFailure(
          res,
          "instagram_profile_lookup_failed"
        );
      }

      /* =========================
         BUILD PROFILE
      ========================= */

      const instagramProfile = {
        verified: true,

        verifiedAt:
          new Date().toISOString(),

        providerId:
          profileData.id || "",

        username:
          profileData.username || "",

        profilePicture:
          profileData.profile_picture_url ||
          "",

        followersCount:
          profileData.followers_count ?? 0,

        followsCount:
          profileData.follows_count ?? 0,

        mediaCount:
          profileData.media_count ?? 0,

        pageId:
          selectedPageId || "",

        pageName:
          selectedPageName || "",
      };

      /* =========================
         PERSIST PROFILE
      ========================= */

      await patchProfileService({
        userId:
          sessionUserId,

        body: {
          profile: {
            social: {
              instagram:
                instagramProfile,
            },
          },
        },

        req,
      });

      console.log(
        "✅ INSTAGRAM VERIFIED:",
        {
          userId:
            sessionUserId,

          instagramId:
            instagramProfile.providerId,

          username:
            instagramProfile.username,

          pageId:
            selectedPageId,
        }
      );

      /* =========================
         CLEAN SESSION
      ========================= */

      delete req.session.igOAuthState;
      delete req.session.userId;

      await new Promise(
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

      /* =========================
         SUCCESS
      ========================= */

      return res.redirect(
        getFrontendRedirect({
          social: "instagram",
          verified: "true",
          username:
            instagramProfile.username,
        })
      );

    } catch (err) {
      console.error(
        "❌ INSTAGRAM CALLBACK ERROR:",
        err
      );

      return redirectFailure(
        res,
        "instagram_callback_failed"
      );
    }
  }
);

/* =========================
   DISCONNECT INSTAGRAM
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
              instagram: null,
            },
          },
        },

        req,
      });

      console.log(
        "✅ INSTAGRAM DISCONNECTED:",
        userId
      );

      return res.status(200).json({
        success: true,
      });

    } catch (err) {
      console.error(
        "❌ INSTAGRAM DISCONNECT ERROR:",
        err
      );

      return res.status(500).json({
        error:
          "instagram_disconnect_failed",
      });
    }
  }
);

export default router;