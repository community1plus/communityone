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


export default router;