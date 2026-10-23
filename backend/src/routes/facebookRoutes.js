
import express from "express";
import crypto from "crypto";

import authMiddleware from "../../middleware/authMiddleware.js";
import { patchProfileService } from "../../services/profileService.js";

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

const SAFE_FAILURE_REASONS = new Set([
    "facebook_verification_failed",
    "missing_user_session",
    "missing_oauth_state",
    "invalid_oauth_state",
    "facebook_authorization_denied",
    "missing_authorization_code",
    "facebook_oauth_not_configured",
    "facebook_token_exchange_failed",
    "facebook_profile_request_failed",
    "facebook_profile_invalid",
    "facebook_session_cleanup_failed",
    "facebook_callback_failed",
    "facebook_start_failed",
]);

function getFrontendRedirect(params = {}) {
    const query = new URLSearchParams(params);

    return (
        `${FRONTEND_URL}/communityplus/profile?` +
        query.toString()
    );
}

function redirectFailure(
    res,
    reason = "facebook_verification_failed"
) {
    const safeReason = SAFE_FAILURE_REASONS.has(reason)
        ? reason
        : "facebook_verification_failed";

    console.warn("[FACEBOOK] OAuth flow failed:", safeReason);

    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    return res.redirect(
        getFrontendRedirect({
            social: "facebook",
            verified: "false",
            reason: safeReason,
        })
    );
}

function saveSession(session) {
    return new Promise((resolve, reject) => {
        session.save((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// ============================================================
// BEGIN FACEBOOK VERIFICATION
// ============================================================

router.post("/begin", authMiddleware, async (req, res) => {
    if (!req.session) {
        console.error("[FACEBOOK] Session middleware unavailable");

        return res.status(500).json({
            error: "Session unavailable",
        });
    }

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Authenticated user ID missing",
        });
    }

    const oauthState = crypto.randomUUID();

    // Bind this OAuth transaction to the canonical application user.
    // Do not store or replace the Cognito subject here.
    req.session.userId = userId;
    req.session.fbOAuthState = oauthState;

    try {
        await saveSession(req.session);

        return res.status(200).json({
            ok: true,
        });
    } catch {
        console.error("[FACEBOOK] Session save failed");

        return res.status(500).json({
            error: "Session save failed",
        });
    }
});

// ============================================================
// START FACEBOOK OAUTH
// ============================================================

router.get("/start", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    const userId = req.session?.userId;
    const state = req.session?.fbOAuthState;

    if (!userId) {
        return redirectFailure(res, "missing_user_session");
    }

    if (!state) {
        return redirectFailure(res, "missing_oauth_state");
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    if (!appId || !redirectUri) {
        console.error("[FACEBOOK] OAuth configuration missing");

        return redirectFailure(
            res,
            "facebook_oauth_not_configured"
        );
    }

    try {
        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            response_type: "code",
            state,
            scope: "public_profile,email",
        });

        return res.redirect(
            `${FB_AUTH_URL}?${params.toString()}`
        );
    } catch {
        console.error("[FACEBOOK] OAuth start failed");

        return redirectFailure(res, "facebook_start_failed");
    }
});

// ============================================================
// FACEBOOK CALLBACK
// ============================================================

router.get("/callback", async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    const session = req.session;
    const userId = session?.userId;
    const expectedState = session?.fbOAuthState;
    const returnedState = req.query?.state;
    const code = req.query?.code;
    const oauthError = req.query?.error;

    if (!session || !userId) {
        return redirectFailure(res, "missing_user_session");
    }

    if (
        typeof expectedState !== "string" ||
        typeof returnedState !== "string" ||
        returnedState.length > 256 ||
        returnedState !== expectedState
    ) {
        console.warn("[FACEBOOK] OAuth state validation failed");

        return redirectFailure(res, "invalid_oauth_state");
    }

    // Consume state before processing the callback to prevent replay.
    delete session.fbOAuthState;

    try {
        await saveSession(session);
    } catch {
        console.error("[FACEBOOK] Failed to consume OAuth state");

        return redirectFailure(
            res,
            "facebook_session_cleanup_failed"
        );
    }

    if (oauthError) {
        console.warn("[FACEBOOK] Authorization declined or failed");

        return redirectFailure(
            res,
            "facebook_authorization_denied"
        );
    }

    if (
        typeof code !== "string" ||
        code.length === 0 ||
        code.length > 4096
    ) {
        return redirectFailure(
            res,
            "missing_authorization_code"
        );
    }

    try {
        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

        if (!appId || !appSecret || !redirectUri) {
            console.error("[FACEBOOK] OAuth configuration missing");

            return redirectFailure(
                res,
                "facebook_oauth_not_configured"
            );
        }

        // Exchange the authorization code without putting the
        // client secret or code in the request URL.
        const tokenParams = new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code,
        });

        const tokenResponse = await fetch(FB_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: tokenParams.toString(),
            signal: AbortSignal.timeout(10000),
        });

        const tokenData = await tokenResponse.json();

        if (
            !tokenResponse.ok ||
            typeof tokenData?.access_token !== "string" ||
            tokenData.access_token.length === 0 ||
            tokenData.access_token.length > 8192
        ) {
            console.warn("[FACEBOOK] Token exchange failed", {
                status: tokenResponse.status,
            });

            return redirectFailure(
                res,
                "facebook_token_exchange_failed"
            );
        }

        const accessToken = tokenData.access_token;

        // Retrieve the Facebook profile. Do not log the token.
        const profileParams = new URLSearchParams({
            fields: "id,name,email,picture.width(400).height(400)",
        });

        const profileResponse = await fetch(
            `${FB_GRAPH_URL}/me?${profileParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(10000),
            }
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            console.warn("[FACEBOOK] Profile request failed", {
                status: profileResponse.status,
            });

            return redirectFailure(
                res,
                "facebook_profile_request_failed"
            );
        }

        if (
            typeof profileData?.id !== "string" ||
            profileData.id.length === 0
        ) {
            console.warn("[FACEBOOK] Invalid profile response");

            return redirectFailure(
                res,
                "facebook_profile_invalid"
            );
        }

        // Page lookup is optional. Its failure must not prevent
        // the user's Facebook profile from being saved.
        let pageCount = 0;

        try {
            const pagesResponse = await fetch(
                `${FB_GRAPH_URL}/me/accounts`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                    signal: AbortSignal.timeout(10000),
                }
            );

            const pagesData = await pagesResponse.json();

            if (pagesResponse.ok) {
                pageCount = Array.isArray(pagesData?.data)
                    ? pagesData.data.length
                    : 0;
            } else {
                console.warn("[FACEBOOK] Page lookup failed", {
                    status: pagesResponse.status,
                });
            }
        } catch {
            console.warn("[FACEBOOK] Page lookup failed");
        }

        const facebookProfile = {
            verified: true,
            verifiedAt: new Date().toISOString(),
            providerId: profileData.id,
            accountName: profileData.name || "",
            email: profileData.email || "",
            profilePicture:
                profileData?.picture?.data?.url || "",
            pageCount,
        };

        // Persist the existing social-profile structure.
        // This is not Cognito identity linking.
        await patchProfileService({
            userId,
            body: {
                profile: {
                    social: {
                        facebook: facebookProfile,
                    },
                },
            },
            req,
        });

        // Clear the temporary OAuth session values.
        delete session.userId;
        delete session.fbOAuthState;

        try {
            await saveSession(session);
        } catch {
            console.error("[FACEBOOK] OAuth session cleanup failed");

            return redirectFailure(
                res,
                "facebook_session_cleanup_failed"
            );
        }

        return res.redirect(
            getFrontendRedirect({
                social: "facebook",
                verified: "true",
            })
        );
    } catch {
        console.error("[FACEBOOK] Facebook callback failed");

        return redirectFailure(
            res,
            "facebook_callback_failed"
        );
    }
});

// ============================================================
// DISCONNECT FACEBOOK
// ============================================================

router.delete(
    "/disconnect",
    authMiddleware,
    async (req, res) => {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                error: "Authenticated user not resolved",
            });
        }

        try {
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

            return res.status(200).json({
                success: true,
                provider: "facebook",
            });
        } catch {
            console.error("[FACEBOOK] Facebook disconnect failed");

            return res.status(500).json({
                error: "Failed to disconnect Facebook",
            });
        }
    }
);

export default router;
