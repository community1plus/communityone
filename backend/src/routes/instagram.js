import express from "express";
import crypto from "crypto";

const router = express.Router();

/* =========================
   INSTAGRAM GRAPH API CONFIG
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
    "https://main.d1ss8rtrtimogr.amplifyapp.com";

  const query =
    new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}

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
   START INSTAGRAM OAUTH
========================= */

router.get("/start", async (req, res) => {

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

    const state =
      crypto.randomUUID();

    req.session.igOAuthState =
      state;

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
          //"instagram_manage_messages",
          //"instagram_manage_comments",
          "pages_show_list",
          "pages_read_engagement",
          "business_management",
        ].join(","),
      });

    const authUrl =
      `${FB_OAUTH_URL}?${params.toString()}`;

    console.log(
      "📘 INSTAGRAM AUTH URL:",
      authUrl
    );

    return res.redirect(authUrl);

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
});

/* =========================
   INSTAGRAM CALLBACK
========================= */

router.get("/callback", async (req, res) => {

  try {

    const {
      code,
      error,
      error_reason,
      error_description,
      state,
    } = req.query;

    console.log(
      "📘 INSTAGRAM CALLBACK QUERY:",
      req.query
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
       MISSING CODE
    ========================= */

    if (!code) {

      return redirectFailure(
        res,
        "missing_instagram_code"
      );
    }

    /* =========================
       STATE CHECK
    ========================= */

    if (
      state !==
      req.session.igOAuthState
    ) {

      console.error(
        "❌ STATE MISMATCH",
        {
          expected:
            req.session.igOAuthState,
          received:
            state,
        }
      );

      return redirectFailure(
        res,
        "instagram_state_mismatch"
      );
    }

    /* =========================
       ENV CHECK
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

    const tokenUrl =
      `${FB_TOKEN_URL}?${tokenParams.toString()}`;

    console.log(
      "📘 TOKEN URL:",
      tokenUrl
    );

    const tokenResponse =
      await fetch(tokenUrl);

    const tokenData =
      await tokenResponse.json();

    console.log(
      "📘 TOKEN RESPONSE:",
      JSON.stringify(
        tokenData,
        null,
        2
      )
    );

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {

      console.error(
        "❌ TOKEN EXCHANGE FAILED:",
        tokenData
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

    const pagesResponse =
      await fetch(
        `${FB_GRAPH_URL}/me/accounts?access_token=${accessToken}`
      );

    const pagesData =
      await pagesResponse.json();

    console.log(
      "📘 FACEBOOK PAGES:",
      JSON.stringify(
        pagesData,
        null,
        2
      )
    );

    if (
      !pagesResponse.ok ||
      !pagesData.data?.length
    ) {

      return redirectFailure(
        res,
        "facebook_pages_lookup_failed"
      );
    }

    /* =========================
       FIND PAGE WITH IG ACCOUNT
    ========================= */

    let instagramBusinessId =
      null;

    let selectedPageId =
      null;

    for (const page of pagesData.data) {

      const pageId =
        page.id;

      const igLookupResponse =
        await fetch(
          `${FB_GRAPH_URL}/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
        );

      const igLookupData =
        await igLookupResponse.json();

      console.log(
        `📘 PAGE ${pageId} IG LOOKUP:`,
        JSON.stringify(
          igLookupData,
          null,
          2
        )
      );

      if (
        igLookupData
          .instagram_business_account
          ?.id
      ) {

        instagramBusinessId =
          igLookupData
            .instagram_business_account
            .id;

        selectedPageId =
          pageId;

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

    const profileResponse =
      await fetch(
        `${FB_GRAPH_URL}/${instagramBusinessId}?fields=id,username,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
      );

    const profileData =
      await profileResponse.json();

    console.log(
      "📘 INSTAGRAM PROFILE:",
      JSON.stringify(
        profileData,
        null,
        2
      )
    );

    if (
      !profileResponse.ok ||
      !profileData.id
    ) {

      return redirectFailure(
        res,
        "instagram_profile_lookup_failed"
      );
    }

    /* =========================
       CLEAN SESSION
    ========================= */

    delete req.session
      .igOAuthState;

    /* =========================
       SUCCESS
    ========================= */

    return res.redirect(
      getFrontendRedirect({

        social: "instagram",

        verified: "true",

        username:
          profileData.username || "",

        instagramId:
          profileData.id || "",

        pageId:
          selectedPageId || "",
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
});

export default router;