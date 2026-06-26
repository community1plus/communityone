import authMiddleware from "../../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels";

function getFrontendRedirect(params = {}) {
  const baseUrl =
    process.env.FRONTEND_URL ||
    "https://main.d1ss8rtrtimogr.amplifyapp.com";

  const query = new URLSearchParams(params);

  return `${baseUrl}/communityplus/profile?${query.toString()}`;
}

function redirectFailure(res, reason = "youtube_verification_failed") {
  return res.redirect(
    getFrontendRedirect({
      social: "youtube",
      verified: "false",
      reason,
    })
  );
}

router.get("/start", async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return redirectFailure(res, "youtube_oauth_not_configured");
    }

const params = new URLSearchParams({

  client_id: process.env.GOOGLE_CLIENT_ID,

  redirect_uri: process.env.GOOGLE_REDIRECT_URI,

  response_type: "code",

  state: req.session.ytOAuthState,

  access_type: "offline",

  prompt: "consent",

  scope:
    "https://www.googleapis.com/auth/youtube.readonly openid email profile",

});

    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (err) {
    console.error("❌ YOUTUBE START ERROR:", err);
    return redirectFailure(res, "youtube_start_failed");
  }
});

router.post("/begin", authMiddleware, (req, res) => {

  req.session.userSub = req.user.sub;
  req.session.ytOAuthState = crypto.randomUUID();

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

});

router.get("/callback", async (req, res) => {
  const userSub = req.session.userSub;

if (!userSub) {

  return redirectFailure(
    res,
    "missing_user_session"
  );

}
  try {
    const code = req.query.code;
    const oauthError = req.query.error;

    if (oauthError) {
      return redirectFailure(res, String(oauthError));
    }

    if (state !== req.session.ytOAuthState) {

      return redirectFailure(
        res,
        "youtube_state_mismatch"
      );

    }

    if (!code) {
      return redirectFailure(res, "missing_youtube_code");
    }

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      return redirectFailure(res, "youtube_oauth_not_configured");
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("❌ YOUTUBE TOKEN ERROR:", tokenData);
      return redirectFailure(res, "youtube_token_exchange_failed");
    }

    const channelResponse = await fetch(
      `${YOUTUBE_CHANNELS_URL}?part=snippet,statistics,brandingSettings&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const channelData = await channelResponse.json();

    if (!channelResponse.ok) {
      console.error("❌ YOUTUBE CHANNEL ERROR:", channelData);
      return redirectFailure(res, "youtube_channel_lookup_failed");
    }

    const channel = channelData?.items?.[0];

    if (!channel) {
      return redirectFailure(res, "no_youtube_channel_found");
    }

    const channelId = channel.id;
    const channelTitle = channel.snippet?.title || "YouTube channel";
    const channelDescription = channel.snippet?.description || "";
    const customUrl = channel.snippet?.customUrl || "";
    const thumbnail =
      channel.snippet?.thumbnails?.high?.url ||
      channel.snippet?.thumbnails?.medium?.url ||
      channel.snippet?.thumbnails?.default?.url ||
      "";

    const subscriberCount = channel.statistics?.subscriberCount || "";
    const videoCount = channel.statistics?.videoCount || "";
    const viewCount = channel.statistics?.viewCount || "";
    const country = channel.snippet?.country || "";
    const publishedAt = channel.snippet?.publishedAt || "";


    delete req.session.userSub;
    delete req.session.ytOAuthState;  
return res.redirect(
  getFrontendRedirect({

    social: "youtube",

    verified: "true",

    channelId,

    channelTitle,

    profilePicture: thumbnail,

    subscriberCount,

    videoCount,

    viewCount,

    customUrl,

    country,

  })
  
);
  } catch (err) {
    console.error("❌ YOUTUBE CALLBACK ERROR:", err);
    return redirectFailure(res, "youtube_callback_failed");
  }
});

export default router;