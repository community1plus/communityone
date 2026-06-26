import express from "express";
import crypto from "crypto";
import pkceChallenge from "pkce-challenge";

const router = express.Router();

/* =========================
   X CONFIG
========================= */

const X_AUTH_URL =
  "https://twitter.com/i/oauth2/authorize";

const X_TOKEN_URL =
  "https://api.x.com/2/oauth2/token";

const X_ME_URL =
  "https://api.x.com/2/users/me?user.fields=profile_image_url,verified,description,public_metrics";

/* =========================
   FRONTEND REDIRECT
========================= */

return res.redirect(
  getFrontendRedirect({

    social: "x",

    verified: "true",

    username:
      user.username,

    displayName:
      user.name,

    profileImage:
      user.profile_image_url,

    verifiedBadge:
      user.verified,

    description:
      user.description,

    followers:
      user.public_metrics
        ?.followers_count,

    following:
      user.public_metrics
        ?.following_count,

    tweets:
      user.public_metrics
        ?.tweet_count,

  })
);

function redirectFailure(
  res,
  reason = "x_verification_failed"
) {

  return res.redirect(
    getFrontendRedirect({
      social: "x",
      verified: "false",
      reason,
    })
  );
}

router.post(
  "/begin",
  async (req, res) => {

    req.session.userSub =
      req.user.sub;

    req.session.xOAuthState =
      crypto.randomUUID();

    const {
      code_verifier,
      code_challenge,
    } = await pkceChallenge();

    req.session.xCodeVerifier =
      code_verifier;

    req.session.save(err => {

      if (err) {

        return res.status(500).json({
          error: "Session save failed",
        });

      }

      res.json({
        ok: true,
      });

    });

  }
);

/* =========================
   START OAUTH
========================= */

router.get("/start", async (req, res) => {

  try {

    if (
      !process.env.X_CLIENT_ID ||
      !process.env.X_REDIRECT_URI
    ) {

      return redirectFailure(
        res,
        "x_oauth_not_configured"
      );
    }

    const {
      code_verifier,
      code_challenge,
    } = await pkceChallenge();

    const state =
  req.session.xOAuthState;

if (!state) {

  return redirectFailure(
    res,
    "missing_user_session"
  );

}

    req.session.xCodeVerifier =
      code_verifier;


    const params = new URLSearchParams({
      response_type: "code",

      client_id:
        process.env.X_CLIENT_ID,

      redirect_uri:
        process.env.X_REDIRECT_URI,

      scope:
        "users.read tweet.read offline.access",

      state,

      code_challenge,

      code_challenge_method:
        "S256",
    });

    return res.redirect(
      `${X_AUTH_URL}?${params.toString()}`
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
});

/* =========================
   CALLBACK
========================= */

router.get("/callback", async (req, res) => {
const userSub =
  req.session.userSub;

if (!userSub) {

    return redirectFailure(
        res,
        "missing_user_session"
    );

}
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
        "missing_x_code"
      );
    }

    if (
      state !==
      req.session.xOAuthState
    ) {

      return redirectFailure(
        res,
        "x_state_mismatch"
      );
    }

    if (
      !process.env.X_CLIENT_ID ||
      !process.env.X_CLIENT_SECRET ||
      !process.env.X_REDIRECT_URI
    ) {


      delete req.session.xOAuthState;

delete req.session.xCodeVerifier;

delete req.session.userSub;

      return redirectFailure(
        res,
        "x_oauth_not_configured"
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
              code,

              grant_type:
                "authorization_code",

              client_id:
                process.env.X_CLIENT_ID,

              redirect_uri:
                process.env.X_REDIRECT_URI,

              code_verifier:
                req.session
                  .xCodeVerifier,
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
        "❌ X TOKEN ERROR:",
        tokenData
      );

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

    if (
      !meResponse.ok ||
      !meData.data
    ) {

      console.error(
        "❌ X PROFILE ERROR:",
        meData
      );

      return redirectFailure(
        res,
        "x_profile_lookup_failed"
      );
    }

    const user = meData.data;

    /* =========================
       CLEAN SESSION
    ========================= */

    delete req.session
      .xCodeVerifier;

    delete req.session
      .xOAuthState;

    /* =========================
       SUCCESS REDIRECT
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
          user.public_metrics
            ?.followers_count || 0,

        following:
          user.public_metrics
            ?.following_count || 0,

        tweets:
          user.public_metrics
            ?.tweet_count || 0,
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
});

export default router;