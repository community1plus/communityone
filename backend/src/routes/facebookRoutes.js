import express from "express";
import crypto from "crypto";

import authMiddleware
    from "../../middleware/authMiddleware.js";

import {
    patchProfileService,
} from "../../services/profileService.js";

const router = express.Router();

const FB_AUTH_URL =
    "https://www.facebook.com/v25.0/dialog/oauth";

const FB_TOKEN_URL =
    "https://graph.facebook.com/v25.0/oauth/access_token";

const FB_GRAPH_URL =
    "https://graph.facebook.com/v25.0";

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "https://develop.d1ss8rtrtimogr.amplifyapp.com";


// ============================================================
// HELPERS
// ============================================================

function getFrontendRedirect(params = {}) {

    const query =
        new URLSearchParams(params);

    return (
        `${FRONTEND_URL}` +
        `/communityplus/profile?` +
        `${query.toString()}`
    );
}


function redirectFailure(
    res,
    reason = "facebook_verification_failed"
) {

    console.error(
        "[FACEBOOK] FAILURE:",
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


// ============================================================
// BEGIN FACEBOOK VERIFICATION
// ============================================================

router.post(
    "/begin",
    authMiddleware,
    (req, res) => {

        console.log(
            "[FACEBOOK] BEGIN"
        );

        const userId =
            req.user?.userId;

        if (!userId) {

            console.error(
                "[FACEBOOK] BEGIN: " +
                "missing internal userId"
            );

            return res.status(401).json({
                error:
                    "Authenticated user ID missing",
            });
        }


        const oauthState =
            crypto.randomUUID();


        /*
         * Bind the OAuth transaction to the
         * authenticated application user.
         *
         * Do NOT store the Cognito subject here.
         */
        req.session.userId =
            userId;

        req.session.fbOAuthState =
            oauthState;


        console.log(
            "[FACEBOOK] Saving OAuth session:",
            {
                sessionId:
                    req.sessionID,

                userId,

                hasState:
                    Boolean(oauthState),
            }
        );

        console.log("[FACEBOOK] BEGIN SESSION:", {
  sessionId: req.sessionID,
  userId: req.session.userId,
  state: req.session.fbOAuthState,
});

        req.session.save((err) => {

            if (err) {

                console.error(
                    "[FACEBOOK] " +
                    "SESSION SAVE ERROR:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Session save failed",
                });
            }


            console.log(
                "[FACEBOOK] " +
                "SESSION SAVED"
            );


            return res.status(200).json({
                ok: true,
            });
        });
    }
);


// ============================================================
// START FACEBOOK OAUTH
// ============================================================

router.get(
    "/start",
    (req, res) => {

        console.log(
            "[FACEBOOK] START"
        );

console.log("[FACEBOOK] START SESSION:", {
  sessionId: req.sessionID,
  userId: req.session.userId,
  state: req.session.fbOAuthState,
  cookie: req.headers.cookie || null,
});
        const userId =
            req.session?.userId;

        const state =
            req.session?.fbOAuthState;


        console.log(
            "[FACEBOOK] OAuth session:",
            {
                sessionId:
                    req.sessionID,

                userId,

                hasState:
                    Boolean(state),
            }
        );


        // ----------------------------------------------------
        // SESSION VALIDATION
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // CONFIGURATION VALIDATION
        // ----------------------------------------------------

        const appId =
            process.env.FACEBOOK_APP_ID;

        const redirectUri =
            process.env.FACEBOOK_REDIRECT_URI;


        if (!appId || !redirectUri) {

            console.error(
                "[FACEBOOK] " +
                "OAuth configuration missing"
            );

            return redirectFailure(
                res,
                "facebook_oauth_not_configured"
            );
        }


        // ----------------------------------------------------
        // BUILD FACEBOOK AUTHORIZATION URL
        // ----------------------------------------------------

        try {

            const params =
                new URLSearchParams({
                    client_id:
                        appId,

                    redirect_uri:
                        redirectUri,

                    response_type:
                        "code",

                    state,

                    scope:
                        "public_profile,email",
                });


            const authUrl =
                `${FB_AUTH_URL}?${params.toString()}`;


            console.log(
                "[FACEBOOK] " +
                "Authorization URL generated"
            );


            return res.redirect(
                authUrl
            );

        } catch (err) {

            console.error(
                "[FACEBOOK] " +
                "START ERROR:",
                err
            );

            return redirectFailure(
                res,
                "facebook_start_failed"
            );
        }
    }
);


// ============================================================
// FACEBOOK CALLBACK
// ============================================================
//
// We will add this next.
// Do not add the legacy callback yet.
// ============================================================


// ============================================================
// FACEBOOK DISCONNECT
// ============================================================
//
// We will add this after the callback.
// ============================================================

router.get(
    "/callback",
    async (req, res) => {

        console.log(
            "[FACEBOOK] CALLBACK"
        );

console.log("[FACEBOOK] CALLBACK SESSION:", {
  sessionId: req.sessionID,
  userId: req.session.userId,
  state: req.session.fbOAuthState,
  cookie: req.headers.cookie || null,
});

        const userId =
            req.session?.userId;

        const expectedState =
            req.session?.fbOAuthState;

        const returnedState =
            req.query?.state;

        const code =
            req.query?.code;

        const oauthError =
            req.query?.error;


        console.log(
            "[FACEBOOK] Callback session:",
            {
                sessionId:
                    req.sessionID,

                userId,

                hasExpectedState:
                    Boolean(expectedState),

                hasReturnedState:
                    Boolean(returnedState),

                hasCode:
                    Boolean(code),

                oauthError:
                    oauthError || null,
            }
        );


        // ====================================================
        // SESSION VALIDATION
        // ====================================================

        if (!userId) {

            return redirectFailure(
                res,
                "missing_user_session"
            );
        }


        // ====================================================
        // OAUTH ERROR
        // ====================================================

        if (oauthError) {

            console.error(
                "[FACEBOOK] OAuth error:",
                oauthError
            );

            return redirectFailure(
                res,
                oauthError
            );
        }


        // ====================================================
        // STATE VALIDATION
        // ====================================================

        if (!expectedState) {

            return redirectFailure(
                res,
                "missing_oauth_state"
            );
        }


        if (
            !returnedState ||
            returnedState !== expectedState
        ) {

            console.error(
                "[FACEBOOK] " +
                "OAuth state mismatch"
            );

            return redirectFailure(
                res,
                "invalid_oauth_state"
            );
        }


        // ====================================================
        // CODE VALIDATION
        // ====================================================

        if (!code) {

            return redirectFailure(
                res,
                "missing_authorization_code"
            );
        }


        try {

            // ==================================================
            // ENVIRONMENT
            // ==================================================

            const appId =
                process.env.FACEBOOK_APP_ID;

            const appSecret =
                process.env.FACEBOOK_APP_SECRET;

            const redirectUri =
                process.env.FACEBOOK_REDIRECT_URI;


            if (
                !appId ||
                !appSecret ||
                !redirectUri
            ) {

                console.error(
                    "[FACEBOOK] " +
                    "OAuth configuration missing"
                );

                return redirectFailure(
                    res,
                    "facebook_oauth_not_configured"
                );
            }


            // ==================================================
            // EXCHANGE CODE FOR ACCESS TOKEN
            // ==================================================

            console.log(
                "[FACEBOOK] " +
                "Exchanging authorization code"
            );


            const tokenParams =
                new URLSearchParams({
                    client_id:
                        appId,

                    client_secret:
                        appSecret,

                    redirect_uri:
                        redirectUri,

                    code,
                });


            const tokenResponse =
                await fetch(
                    `${FB_TOKEN_URL}?${tokenParams.toString()}`,
                    {
                        method: "GET",
                    }
                );


            const tokenData =
                await tokenResponse.json();


            if (
                !tokenResponse.ok ||
                !tokenData.access_token
            ) {

                console.error(
                    "[FACEBOOK] " +
                    "Token exchange failed:",
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


            console.log(
                "[FACEBOOK] " +
                "Access token received"
            );


            // ==================================================
            // GET FACEBOOK PROFILE
            // ==================================================

            const profileParams =
                new URLSearchParams({
                    fields:
                        "id,name,email,picture.width(400).height(400)",

                    access_token:
                        accessToken,
                });


            const profileResponse =
                await fetch(
                    `${FB_GRAPH_URL}/me?${profileParams.toString()}`
                );


            const profileData =
                await profileResponse.json();


            if (!profileResponse.ok) {

                console.error(
                    "[FACEBOOK] " +
                    "Profile request failed:",
                    {
                        status:
                            profileResponse.status,

                        error:
                            profileData?.error,
                    }
                );

                return redirectFailure(
                    res,
                    "facebook_profile_request_failed"
                );
            }


            console.log(
                "[FACEBOOK] " +
                "Facebook profile received:",
                {
                    id:
                        profileData?.id,

                    name:
                        profileData?.name,

                    hasEmail:
                        Boolean(profileData?.email),

                    hasPicture:
                        Boolean(
                            profileData?.picture?.data?.url
                        ),
                }
            );


            // ==================================================
            // GET FACEBOOK PAGES
            // ==================================================

            let pageCount = 0;


            try {

                const pagesParams =
                    new URLSearchParams({
                        access_token:
                            accessToken,
                    });


                const pagesResponse =
                    await fetch(
                        `${FB_GRAPH_URL}/me/accounts?${pagesParams.toString()}`
                    );


                const pagesData =
                    await pagesResponse.json();


                if (pagesResponse.ok) {

                    pageCount =
                        Array.isArray(
                            pagesData?.data
                        )
                            ? pagesData.data.length
                            : 0;

                } else {

                    console.warn(
                        "[FACEBOOK] " +
                        "Could not retrieve pages:",
                        pagesData?.error
                    );
                }

            } catch (pageError) {

                console.warn(
                    "[FACEBOOK] " +
                    "Page lookup failed:",
                    pageError
                );
            }


            // ==================================================
            // BUILD COMMUNITY ONE SOCIAL PROFILE
            // ==================================================

            const facebookProfile = {

                verified: true,

                verifiedAt:
                    new Date().toISOString(),

                providerId:
                    profileData.id,

                accountName:
                    profileData.name || "",

                email:
                    profileData.email || "",

                profilePicture:
                    profileData
                        ?.picture
                        ?.data
                        ?.url || "",

                pageCount,
            };


            console.log(
                "[FACEBOOK] " +
                "Saving verified Facebook identity:",
                {
                    userId,

                    providerId:
                        facebookProfile.providerId,

                    accountName:
                        facebookProfile.accountName,

                    pageCount:
                        facebookProfile.pageCount,
                }
            );


            // ==================================================
            // PERSIST PROFILE
            // ==================================================

            await patchProfileService({

                userId,

                body: {

                    profile: {

                        social: {

                            facebook:
                                facebookProfile,
                        },
                    },
                },

                req,
            });


            console.log(
                "[FACEBOOK] " +
                "PROFILE UPDATED"
            );


            // ==================================================
            // CONSUME OAUTH SESSION
            // ==================================================

            delete req.session.userId;

            delete req.session.fbOAuthState;


            req.session.save((err) => {

                if (err) {

                    console.error(
                        "[FACEBOOK] " +
                        "SESSION CLEANUP ERROR:",
                        err
                    );

                    return redirectFailure(
                        res,
                        "facebook_session_cleanup_failed"
                    );
                }


                console.log(
                    "[FACEBOOK] " +
                    "OAuth session consumed"
                );


                // ==============================================
                // SUCCESS
                // ==============================================

                return res.redirect(
                    getFrontendRedirect({
                        social:
                            "facebook",

                        verified:
                            "true",
                    })
                );
            });

        } catch (err) {

            console.error(
                "[FACEBOOK] " +
                "CALLBACK ERROR:",
                err
            );

            return redirectFailure(
                res,
                "facebook_callback_failed"
            );
        }
    }
);

// ======================================================
// DISCONNECT FACEBOOK
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
        "🔌 DISCONNECTING FACEBOOK:",
        {
          userId,
        }
      );

      await patchProfileService({
        userId,
        body: {
          profile: {
            social: {
              facebook: null,
            },
          },
        },
        req,
      });

      console.log(
        "✅ FACEBOOK DISCONNECTED:",
        {
          userId,
        }
      );

      return res.status(200).json({
        success: true,
        provider: "facebook",
      });

    } catch (err) {
      console.error(
        "❌ FACEBOOK DISCONNECT ERROR:",
        err
      );

      return res.status(500).json({
        error: "Failed to disconnect Facebook",
      });
    }
  }
);

export default router;