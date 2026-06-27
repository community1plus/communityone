import express from "express";
import crypto from "crypto";
import authMiddleware from "../../middleware/authMiddleware.js";
import { saveProfile } from "../../controllers/profileController.js";

const router = express.Router();

/* =========================
   FACEBOOK GRAPH CONFIG
========================= */

const FB_AUTH_URL =
  "https://www.facebook.com/v25.0/dialog/oauth";

const FB_TOKEN_URL =
  "https://graph.facebook.com/v25.0/oauth/access_token";

const FB_GRAPH_URL =
  "https://graph.facebook.com/v25.0";

/* =========================
   FRONTEND REDIRECT/
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

router.post(
  "/begin",
  authMiddleware,
  (req, res) => {
  console.log("SESSION ID:", req.sessionID);
    req.session.userSub = req.user.sub;

    req.session.fbOAuthState = crypto.randomUUID();

    req.session.save((err) => {

      if (err) {

        return res.status(500).json({
          error: "Session save failed",
        });

      }

      return res.json({

        ok: true,

      });

    });

  }
);

/* =========================
   START FACEBOOK OAUTH
========================= */

router.get(
  "/start",
  async (req, res) => {
console.log("Building Facebook auth URL...");
    console.log("START SESSION ID:", req.sessionID);
console.log("START SESSION:", req.session);
console.log("=== FACEBOOK START ===");
console.log("Session ID:", req.sessionID);
console.log("Session:", req.session);
console.log("UserSub:", req.session.userSub);
if (!req.session.userSub) {

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
  req.session.fbOAuthState;

if (!state) {

  return redirectFailure(
    res,
    "missing_oauth_state"
  );

}



console.log(
  "Facebook verification started for:",
  req.session.userSub
);

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
      "📘 FACEBOOK AUTH URL:",
      authUrl
    );

    req.session.save((err) => {

  if (err) {

    console.error(
      "Session save failed",
      err
    );

    return redirectFailure(
      res,
      "session_save_failed"
    );

  }
console.log("Redirecting to:", authUrl);
  return res.redirect(
    authUrl
  );

});

  } catch (err) {

    console.error(
      "❌ FACEBOOK START ERROR:",
      err
    );
    console.error("❌ FACEBOOK START ERROR");
console.error("Message:", err.message);
console.error("Stack:", err.stack);
console.error("Full error:", err);

    return redirectFailure(
      res,
      "facebook_start_failed"
    );
  }
});

/* =========================
   FACEBOOK CALLBACK
========================= */

router.get("/callback", async (req, res) => {

  console.log("#################################");
  console.log("FACEBOOK CALLBACK HIT");
  console.log("#################################");
  router.get("/callback", async (req, res) => {

  console.log("########################################");
  console.log("FACEBOOK CALLBACK REACHED");
  console.log("QUERY:", req.query);
  console.log("SESSION:", req.session);
  console.log("########################################");

    const {
      code,
      error,
      error_reason,
      error_description,
      state,
    } = req.query;

const userSub = req.session.userSub;

console.log(
  "Facebook callback for:",
  userSub
);

if (!req.session.userSub) {

    return redirectFailure(
        res,
        "missing_user_session"
    );

}

    console.log(
      "📘 FACEBOOK CALLBACK QUERY:",
      req.query
    );

    /* =========================
       OAUTH ERROR
    ========================= */

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

    /* =========================
       MISSING CODE
    ========================= */

    if (!code) {

      return redirectFailure(
        res,
        "missing_facebook_code"
      );
    }

    /* =========================
       STATE CHECK
    ========================= */

    if (
      state !==
      req.session.fbOAuthState
    ) {

      console.error(
        "❌ FACEBOOK STATE MISMATCH",
        {
          expected:
            req.session.fbOAuthState,
          received:
            state,
        }
      );

      return redirectFailure(
        res,
        "facebook_state_mismatch"
      );
    }

    /* =========================
       ENV CHECK
    ========================= */

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

    /* =========================
       TOKEN EXCHANGE
    ========================= */

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
      `${FB_TOKEN_URL}?${tokenParams.toString()}`;

    console.log(
      "📘 FACEBOOK TOKEN URL:",
      tokenUrl
    );

    const tokenResponse =
      await fetch(tokenUrl);

    const tokenData =
      await tokenResponse.json();

    console.log(
      "📘 FACEBOOK TOKEN RESPONSE:",
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
        "❌ FACEBOOK TOKEN EXCHANGE FAILED:",
        tokenData
      );

      return redirectFailure(
        res,
        "facebook_token_exchange_failed"
      );
    }

    const accessToken =
      tokenData.access_token;

    /* =========================
       GET FACEBOOK PROFILE
    ========================= */

    const profileResponse =
      await fetch(
        `${FB_GRAPH_URL}/me?fields=id,name,email,picture.width(400).height(400)&access_token=${accessToken}`
      );

console.log("========== FACEBOOK PROFILE ==========");
console.log(JSON.stringify(profileData, null, 2));

    const profileData =
      await profileResponse.json();


      console.log("PROFILE DATA");
console.log(profileData);
      console.log(
  "FACEBOOK PROFILE RAW"
);

console.log("========== FACEBOOK PROFILE ==========");
console.log(
  JSON.stringify(profileData, null, 2)
);

console.log(
  JSON.stringify(profileData, null, 2)
);

console.log({
  id: profileData.id,
  name: profileData.name,
  email: profileData.email,
  picture: profileData.picture?.data?.url,
});

    console.log(
      "📘 FACEBOOK PROFILE:",
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
        "facebook_profile_lookup_failed"
      );
    }

    /* =========================
       GET FACEBOOK PAGES
    ========================= */

    const pagesResponse =
      await fetch(
        `${FB_GRAPH_URL}/me/accounts?access_token=${accessToken}`
      );

    const pagesData =
      await pagesResponse.json();

      console.log("FACEBOOK PAGES");
console.log(pagesData);

    console.log(
      "📘 FACEBOOK PAGES:",
      JSON.stringify(
        pagesData,
        null,
        2
      )
    );

    const pageCount =
      pagesData?.data?.length || 0;

      console.log(
  "FACEBOOK PROFILE DATA",
  profileData
);

console.log({
  id: profileData.id,
  name: profileData.name,
  email: profileData.email,
  picture: profileData.picture?.data?.url,
});

      const incoming = {

  social: {

    facebook: {

      verified: true,

      verifiedAt:
        new Date().toISOString(),

      providerId:
        profileData.id,

      accountName:
        profileData.name,

      email:
        profileData.email,

      profilePicture:
        profileData.picture?.data?.url,

      pageCount,

    },

  },

};

console.log(
  "Saving Facebook verification",
  incoming
);

console.log(
  "INCOMING FACEBOOK",
  JSON.stringify(incoming, null, 2)
);

console.log(
  "FACEBOOK INCOMING"
);

console.log(
  JSON.stringify(incoming, null, 2)
);

const saved = await saveProfile({
    userId: userSub,
    incoming,
});

console.log("========== FACEBOOK INCOMING ==========");
console.log(JSON.stringify(incoming, null, 2));
console.log(
    "Saved social:"
);

console.log(
    JSON.stringify(saved.social, null, 2)
);


console.log(
  "Facebook verification saved."
);
    /* =========================
       CLEAN SESSION
    ========================= */

delete req.session.fbOAuthState;
delete req.session.userSub;

    /* =========================
       SUCCESS REDIRECT
    ========================= */

return res.redirect(
  getFrontendRedirect({

    social: "facebook",

    verified: "true",

  })
);

  } catch (err) {

    console.error(
      "❌ FACEBOOK CALLBACK ERROR:",
      err
    );

    return redirectFailure(
      res,
      "facebook_callback_failed"
    );
  }
});

export default router;