import express from "express";
import crypto from "crypto";

const router = express.Router();

/* =========================
   INSTAGRAM CONFIG
========================= */

const IG_AUTH_URL =
  "https://www.facebook.com/v23.0/dialog/oauth";

const IG_TOKEN_URL =
  "https://graph.facebook.com/v23.0/oauth/access_token";

const IG_ME_URL =
  "https://graph.instagram.com/me";

/* =========================
   FRONTEND REDIRECT
========================= */

function getFrontendRedirect(params = {}) {

  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://main.d1ss8rtrtimogr.amplifyapp.com";

  const query = new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}

function redirectFailure(
  res,
  reason = "instagram_verification_failed"
) {

  return res.redirect(
    getFrontendRedirect({
      social: "instagram",
      verified: "false",
      reason,
    })
  );
}

/* =========================
   START OAUTH
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

    const state = crypto.randomUUID();

    req.session.igOAuthState = state;

    const params = new URLSearchParams({

      client_id:
        process.env.INSTAGRAM_APP_ID,

      redirect_uri:
        process.env.INSTAGRAM_REDIRECT_URI,

      scope:
        [
          "instagram_basic",
          "pages_show_list",
          "pages_read_engagement",
        ].join(","),

      response_type: "code",

      state,
    });

    return res.redirect(
      `${IG_AUTH_URL}?${params.toString()}`
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
});

/* =========================
   CALLBACK
========================= */

router.get("/callback", async (req, res) => {

  try {

    const code = req.query.code;

    const oauthError =
      req.query.error;

    const state =
      req.query.state;

    if (oauthError) {

      return redirectFailure(
        res,
        String(oauthError)
      );
    }

    if (!code) {

      return redirectFailure(
        res,
        "missing_instagram_code"
      );
    }

    if (
      state !==
      req.session.igOAuthState
    ) {

      return redirectFailure(
        res,
        "instagram_state_mismatch"
      );
    }

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

        grant_type:
          "authorization_code",

        redirect_uri:
          process.env.INSTAGRAM_REDIRECT_URI,

        code,
      });

    const tokenResponse =
      await fetch(
        `${IG_TOKEN_URL}?${tokenParams.toString()}`
      );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {

      console.error(
        "❌ INSTAGRAM TOKEN ERROR:",
        tokenData
      );

      return redirectFailure(
        res,
        "instagram_token_exchange_failed"
      );
    }

    /* =========================
       GET USER PROFILE
    ========================= */

    /* =========================
   GET FACEBOOK PAGES
========================= */

const pagesResponse =
  await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${tokenData.access_token}`
  );

const pagesData =
  await pagesResponse.json();

if (
  !pagesResponse.ok ||
  !pagesData.data?.length
) {

  console.error(
    "❌ FACEBOOK PAGES ERROR:",
    pagesData
  );

  return redirectFailure(
    res,
    "facebook_pages_lookup_failed"
  );
}

/* =========================
   GET INSTAGRAM ACCOUNT
========================= */

const pageId =
  pagesData.data[0].id;

const igResponse =
  await fetch(
    `https://graph.facebook.com/v23.0/${pageId}?fields=instagram_business_account&access_token=${tokenData.access_token}`
  );

const igData =
  await igResponse.json();

if (
  !igData.instagram_business_account?.id
) {

  console.error(
    "❌ INSTAGRAM BUSINESS ACCOUNT ERROR:",
    igData
  );

  return redirectFailure(
    res,
    "instagram_business_account_missing"
  );
}

const instagramId =
  igData.instagram_business_account.id;

/* =========================
   GET INSTAGRAM PROFILE
========================= */

const profileResponse =
  await fetch(
    `https://graph.facebook.com/v23.0/${instagramId}?fields=id,username,profile_picture_url&access_token=${tokenData.access_token}`
  );

const profileData =
  await profileResponse.json();

if (
  !profileResponse.ok ||
  !profileData.id
) {

  console.error(
    "❌ INSTAGRAM PROFILE ERROR:",
    profileData
  );

  return redirectFailure(
    res,
    "instagram_profile_lookup_failed"
  );
}

    const meData =
      await meResponse.json();

    if (
      !meResponse.ok ||
      !meData.id
    ) {

      console.error(
        "❌ INSTAGRAM PROFILE ERROR:",
        meData
      );

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
       SUCCESS REDIRECT
    ========================= */

    return res.redirect(
      getFrontendRedirect({

        social: "instagram",

        verified: "true",

        username:
          meData.username || "",

        instagramId:
          meData.id || "",
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