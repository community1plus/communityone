import express from "express";

import { pool }
    from "../db/pool.js";

import { normalizeProfile }
    from "../utils/normalizeProfile.js";


const router = express.Router();


/* =====================================================
   GET CURRENT USER
===================================================== */

router.get("/", async (req, res) => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "📡 GET /api/me"
        );


        /* =================================================
           AUTHENTICATION
        ================================================= */

        if (!req.user) {

            console.warn(
                "[ME] No authenticated user"
            );

            return res.status(401).json({

                authenticated: false,

            });

        }


        /* =================================================
           COMMUNITY ONE IDENTITY

           req.user.userId
               = Community One internal UUID

           req.user.cognitoSub
               = Cognito subject

           Authentication attributes are the authoritative
           source for account-level identity attributes.
        ================================================= */

        const userId =
            req.user.userId ||
            req.user.id ||
            null;


        const cognitoSub =
            req.user.cognitoSub ||
            null;


        const tokenEmail =
            req.user.email ||
            req.user.attributes?.email ||
            "";


        const tokenUsername =
            req.user.username ||
            req.user["cognito:username"] ||
            req.user.attributes?.preferred_username ||
            "";


        console.log(
            "[ME] AUTH IDENTITY:",
            {
                userId,
                cognitoSub,
                email: tokenEmail,
                username: tokenUsername,
            }
        );


        /* =================================================
           IDENTITY VALIDATION
        ================================================= */

        if (!userId) {

            console.error(
                "[ME] Authenticated request has no Community One userId"
            );

            return res.status(401).json({

                authenticated: false,

                error:
                    "User identity could not be resolved.",

            });

        }


        /* =================================================
           PROFILE
           
           user_profiles.user_id is the Community One
           internal user UUID.

           It is NOT the Cognito subject.
        ================================================= */

        const profileResult =
            await pool.query(
                `
                    SELECT *
                    FROM user_profiles
                    WHERE user_id = $1
                    LIMIT 1
                `,
                [
                    userId,
                ]
            );


        const rawProfile =
            profileResult.rows[0] ||
            null;


        console.log(
            "[ME] RAW PROFILE FULL:",
            JSON.stringify(
                rawProfile,
                null,
                2
            )
        );


        console.log(
            "[ME] PROFILE:",
            {
                found:
                    !!rawProfile,

                profileId:
                    rawProfile?.id ||
                    null,

                userId:
                    rawProfile?.user_id ||
                    null,

                username:
                    rawProfile?.username ||
                    null,

                version:
                    rawProfile?.version ||
                    null,
            }
        );


        /* =================================================
           ORGANISATION PROFILE
        ================================================= */

        let organisationProfile =
            null;


        if (rawProfile?.id) {

            const organisationResult =
                await pool.query(
                    `
                        SELECT *
                        FROM organisation_profiles
                        WHERE user_profile_id = $1
                        LIMIT 1
                    `,
                    [
                        rawProfile.id,
                    ]
                );


            organisationProfile =
                organisationResult.rows[0] ||
                null;


            console.log(
                "[ME] ORGANISATION PROFILE:",
                {
                    found:
                        !!organisationProfile,

                    profileId:
                        rawProfile.id,
                }
            );

        }


        /* =================================================
           NORMALISE PROFILE
        ================================================= */

        const normalizedProfile =
            normalizeProfile(
                rawProfile
            );


        /* =================================================
           CANONICAL ACCOUNT IDENTITY
           
           Username and email have different roles.

           username
               = Community One profile identity

           email
               = authenticated account identity

           The authenticated email is used only when the
           stored profile email is empty.

           We do NOT overwrite an explicitly stored profile
           email here.
        ================================================= */

        const canonicalEmail =
            normalizedProfile?.email ||
            tokenEmail ||
            "";


        const canonicalUsername =
            normalizedProfile?.username ||
            (
                tokenEmail &&
                tokenEmail.includes("@")
                    ? tokenEmail.split("@")[0]
                    : ""
            ) ||
            tokenUsername ||
            "";


        const profile = {

            ...normalizedProfile,


            /* =============================================
               CANONICAL IDENTITY
            ============================================= */

            username:
                canonicalUsername,

            email:
                canonicalEmail,


            /* =============================================
               ORGANISATION / ENTITY
            ============================================= */

            organisationProfile,

            organisation:
                organisationProfile,

        };


        console.log(
            "[ME] CANONICAL IDENTITY:",
            {
                username:
                    profile.username,

                email:
                    profile.email,

                userType:
                    profile.userType,

                identityType:
                    profile.identityType,
            }
        );


        /* =================================================
           NORMALIZED PROFILE
        ================================================= */

        console.log(
            "[ME] NORMALIZED PROFILE:",
            JSON.stringify(
                profile,
                null,
                2
            )
        );


        /* =================================================
           SOCIAL PROVIDERS
        ================================================= */

        const social =
            profile?.social ||
            {};


        const providers = {

            facebook:
                !!social?.facebook?.verified,

            instagram:
                !!social?.instagram?.verified,

            youtube:
                !!social?.youtube?.verified,

            x:
                !!social?.x?.verified,

        };


        /* =================================================
           USER RESPONSE
        ================================================= */

        const emailLocalPart =
            tokenEmail &&
            tokenEmail.includes("@")
                ? tokenEmail.split("@")[0]
                : "";


        const user = {

            /* ---------------------------------------------
               Community One identity
            --------------------------------------------- */

            id:
                userId,


            /* ---------------------------------------------
               Cognito identity
            --------------------------------------------- */

            cognitoSub:
                cognitoSub,


            /* ---------------------------------------------
               Authenticated account email
            --------------------------------------------- */

            email:
                tokenEmail,


            /* ---------------------------------------------
               Community One username
            --------------------------------------------- */

            username:
                profile?.username ||
                emailLocalPart ||
                tokenUsername ||
                "",


            /* ---------------------------------------------
               Display name
            --------------------------------------------- */

            displayName:
                profile?.displayName ||
                emailLocalPart ||
                tokenUsername ||
                "",


            /* ---------------------------------------------
               Profile existence
            --------------------------------------------- */

            profileCompleted:
                !!profile,

        };


        /* =================================================
           RESPONSE
        ================================================= */

        const response = {

            authenticated:
                true,

            user,

            profile,

            providers,

        };


        console.log(
            "[ME] SUCCESS:",
            {
                userId,

                profileId:
                    rawProfile?.id ||
                    null,

                version:
                    rawProfile?.version ||
                    null,

                username:
                    profile.username,

                email:
                    profile.email,

            }
        );


        console.log(
            "========================================"
        );


        return res.status(200).json(
            response
        );


    } catch (err) {

        console.error(
            "❌ [ME] GET /api/me ERROR:",
            {
                message:
                    err.message,

                stack:
                    err.stack,
            }
        );


        return res.status(500).json({

            error:
                "Failed to fetch current user",

            detail:
                err.message,

        });

    }

});


export default router;