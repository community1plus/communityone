import { pool } from "../src/db/db.js";

import {
    getUserId,
    isBusinessType,
    pickProfileFields,
    pickOrganisationFields,
} from "../helpers/profileHelpers.js";

import {
    fetchProfileByUserId,
    saveProfile,
} from "../repositories/profileRepository.js";


/* =========================================================
   ENDPOINT DETAILS
========================================================= */

function getEndpointDetails(
    req,
    bodyEndpoint = {}
) {

    const forwardedFor =
        req.headers["x-forwarded-for"]
            ?.split(",")[0]
            ?.trim();

    return {

        ...(bodyEndpoint || {}),

        ipAddress:
            forwardedFor ||
            req.headers["x-real-ip"] ||
            req.ip ||
            "",

        serverUserAgent:
            req.headers["user-agent"] ||
            "",

        capturedAt:
            bodyEndpoint?.capturedAt ||
            new Date().toISOString(),

    };

}


/* =========================================================
   ORGANISATION
========================================================= */

async function fetchOrganisationByProfileId(
    userProfileId
) {

    if (!userProfileId) {

        console.log(
            "[PROFILE ORG] No profile ID supplied"
        );

        return null;

    }


    console.log(
        "[PROFILE ORG] Looking up organisation:",
        userProfileId
    );


    const result =
        await pool.query(
            `
            SELECT *
            FROM organisation_profiles
            WHERE user_profile_id = $1
            LIMIT 1
            `,
            [userProfileId]
        );


    console.log(
        "[PROFILE ORG] Result:",
        result.rows
    );


    return result.rows[0] || null;

}


async function saveOrganisationProfile({
    userProfileId,
    organisation,
}) {

    if (
        !userProfileId ||
        !organisation?.organisation_name
    ) {

        console.log(
            "[PROFILE ORG] Nothing to save"
        );

        return null;

    }


    console.log(
        "[PROFILE ORG] Saving organisation:",
        {
            userProfileId,
            organisation,
        }
    );


    const result =
        await pool.query(
            `
            INSERT INTO organisation_profiles (
                user_profile_id,
                organisation_name,
                trading_name,
                organisation_email,
                organisation_phone,
                website,
                location,
                email_verified,
                phone_verified,
                ownership_verified,
                business_level,
                source,
                updated_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7::jsonb,
                $8,
                $9,
                $10,
                $11,
                $12,
                NOW()
            )

            ON CONFLICT (user_profile_id)

            DO UPDATE SET

                organisation_name =
                    EXCLUDED.organisation_name,

                trading_name =
                    EXCLUDED.trading_name,

                organisation_email =
                    EXCLUDED.organisation_email,

                organisation_phone =
                    EXCLUDED.organisation_phone,

                website =
                    EXCLUDED.website,

                location =
                    EXCLUDED.location,

                email_verified =
                    EXCLUDED.email_verified,

                phone_verified =
                    EXCLUDED.phone_verified,

                ownership_verified =
                    EXCLUDED.ownership_verified,

                business_level =
                    EXCLUDED.business_level,

                source =
                    EXCLUDED.source,

                updated_at =
                    NOW()

            RETURNING *
            `,
            [

                userProfileId,

                organisation.organisation_name,

                organisation.trading_name,

                organisation.organisation_email,

                organisation.organisation_phone,

                organisation.website,

                organisation.location
                    ? JSON.stringify(
                        organisation.location
                    )
                    : null,

                organisation.email_verified,

                organisation.phone_verified,

                organisation.ownership_verified,

                organisation.business_level,

                organisation.source,

            ]
        );


    console.log(
        "[PROFILE ORG] Saved:",
        result.rows[0]
    );


    return result.rows[0];

}


/* =========================================================
   ORGANISATION NORMALISATION
========================================================= */

function normaliseOrganisationProfile(
    org
) {

    if (!org) {
        return null;
    }


    return {

        id:
            org.id,

        userProfileId:
            org.user_profile_id,

        organisationName:
            org.organisation_name || "",

        tradingName:
            org.trading_name || "",

        organisationEmail:
            org.organisation_email || "",

        organisationPhone:
            org.organisation_phone || "",

        website:
            org.website || "",

        location:
            org.location || null,

        emailVerified:
            Boolean(
                org.email_verified
            ),

        phoneVerified:
            Boolean(
                org.phone_verified
            ),

        ownershipVerified:
            Boolean(
                org.ownership_verified
            ),

        businessLevel:
            org.business_level || 1,

        source:
            org.source || "manual",

        createdAt:
            org.created_at,

        updatedAt:
            org.updated_at,

    };

}


/* =========================================================
   GET PROFILE
========================================================= */

export async function getProfile(
    req,
    res
) {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "[PROFILE GET] START"
        );


        /* -----------------------------------------
           AUTH
        ----------------------------------------- */

        console.log(
            "[PROFILE GET] req.user:",
            JSON.stringify(
                req.user,
                null,
                2
            )
        );


        const userId =
            getUserId(req);


        console.log(
            "[PROFILE GET] resolved userId:",
            userId
        );


        if (!userId) {

            console.error(
                "[PROFILE GET] NO USER ID"
            );

            return res.status(401).json({
                error:
                    "Authentication required.",
            });

        }


        /* -----------------------------------------
           PROFILE
        ----------------------------------------- */

        const profile =
            await fetchProfileByUserId(
                userId
            );


        console.log(
            "[PROFILE GET] repository profile:",
            profile
        );


        if (!profile) {

            console.warn(
                "[PROFILE GET] PROFILE NOT FOUND:",
                userId
            );

            return res.status(404).json({
                error:
                    "Profile not found",
            });

        }


        /* -----------------------------------------
           ORGANISATION
        ----------------------------------------- */

        const organisationProfile =
            await fetchOrganisationByProfileId(
                profile.id
            );


        return res.json({

            profile,

            organisationProfile:
                normaliseOrganisationProfile(
                    organisationProfile
                ),

            version:
                profile.version,

        });

    } catch (err) {

        console.error(
            "[PROFILE GET] FAILED:",
            err
        );


        return res.status(500).json({

            error:
                "Profile load failed",

            detail:
                err.message,

        });

    }

}


/* =========================================================
   PATCH PROFILE
========================================================= */

/* =========================================================
   PATCH PROFILE
========================================================= */

export async function patchProfile(req, res) {

    console.log("\n========================================");
    console.log("[PROFILE PATCH] START");
    console.log("========================================");

    try {

        /* -----------------------------------------
           REQUEST
        ----------------------------------------- */

        console.log(
            "[PROFILE PATCH] METHOD:",
            req.method
        );

        console.log(
            "[PROFILE PATCH] URL:",
            req.originalUrl
        );

        console.log(
            "[PROFILE PATCH] REQ.USER:",
            JSON.stringify(
                req.user,
                null,
                2
            )
        );


        /* -----------------------------------------
           AUTH
        ----------------------------------------- */

        const userId =
            getUserId(req);

        console.log(
            "[PROFILE PATCH] RESOLVED USER ID:",
            userId
        );


        if (!userId) {

            console.error(
                "[PROFILE PATCH] NO USER ID"
            );

            return res.status(401).json({
                error:
                    "Authentication required.",
            });

        }


        /* -----------------------------------------
           BODY
        ----------------------------------------- */

        console.log(
            "[PROFILE PATCH] BODY:",
            JSON.stringify(
                req.body,
                null,
                2
            )
        );


        /* -----------------------------------------
           EXISTING PROFILE
        ----------------------------------------- */

        const existing =
            await fetchProfileByUserId(
                userId
            );

        console.log(
            "[PROFILE PATCH] REPOSITORY PROFILE:",
            existing
        );


        if (!existing) {

            console.warn(
                "[PROFILE PATCH] PROFILE NOT FOUND:",
                userId
            );

            return res.status(404).json({
                error:
                    "Profile not found",
            });

        }


        /* -----------------------------------------
           PROFILE
        ----------------------------------------- */

        const incoming =
            pickProfileFields(
                req.body?.profile || {}
            );


        incoming.endpoint =
            getEndpointDetails(
                req,
                req.body?.endpoint
            );


        console.log(
            "[PROFILE PATCH] INCOMING PROFILE:",
            JSON.stringify(
                incoming,
                null,
                2
            )
        );


        /* -----------------------------------------
           ORGANISATION
        ----------------------------------------- */

        const organisation =
            pickOrganisationFields(
                req.body?.organisationProfile || {}
            );


        console.log(
            "[PROFILE PATCH] ORGANISATION:",
            JSON.stringify(
                organisation,
                null,
                2
            )
        );


        /* -----------------------------------------
           SAVE PROFILE
        ----------------------------------------- */

        console.log(
            "[PROFILE PATCH] SAVING PROFILE..."
        );


        const saved =
            await saveProfile({
                userId,
                incoming,
            });


        console.log(
            "[PROFILE PATCH] PROFILE SAVED:",
            saved
        );


        /* -----------------------------------------
           SAVE ORGANISATION
        ----------------------------------------- */

        let savedOrganisation =
            null;


        if (
            isBusinessType(
                saved.userType
            ) &&
            organisation
        ) {

            console.log(
                "[PROFILE PATCH] SAVING ORGANISATION..."
            );


            savedOrganisation =
                await saveOrganisationProfile({

                    userProfileId:
                        saved.id,

                    organisation,

                });


        } else {

            savedOrganisation =
                await fetchOrganisationByProfileId(
                    saved.id
                );

        }


        /* -----------------------------------------
           RESPONSE
        ----------------------------------------- */

        console.log(
            "[PROFILE PATCH] SUCCESS"
        );


        return res.json({

            profile:
                saved,

            organisationProfile:
                normaliseOrganisationProfile(
                    savedOrganisation
                ),

            version:
                saved.version,

        });


    } catch (err) {

        console.error(
            "[PROFILE PATCH] FAILED:",
            err
        );


        return res.status(500).json({

            error:
                "Profile update failed",

            detail:
                err.message,

        });

    }

}

/* =========================================================
   PUT PROFILE
========================================================= */

export async function putProfile(
    req,
    res
) {

    try {

        console.log(
            "[PROFILE PUT] START"
        );


        const userId =
            getUserId(req);


        console.log(
            "[PROFILE PUT] resolved userId:",
            userId
        );


        if (!userId) {

            return res.status(401).json({

                error:
                    "Authentication required.",

            });

        }


        const incoming =
            pickProfileFields(
                req.body || {}
            );


        incoming.endpoint =
            getEndpointDetails(
                req,
                req.body?.endpoint
            );


        const organisation =
            pickOrganisationFields(
                req.body || {}
            );


        console.log(
            "[PROFILE PUT] INCOMING:",
            JSON.stringify(
                incoming,
                null,
                2
            )
        );


        const saved =
            await saveProfile({

                userId,

                incoming,

            });


        let savedOrganisation =
            null;


        if (
            isBusinessType(
                saved.userType
            ) &&
            organisation
        ) {

            savedOrganisation =
                await saveOrganisationProfile({

                    userProfileId:
                        saved.id,

                    organisation,

                });

        } else {

            savedOrganisation =
                await fetchOrganisationByProfileId(
                    saved.id
                );

        }


        console.log(
            "[PROFILE PUT] SUCCESS"
        );


        return res.json({

            profile:
                saved,

            organisationProfile:
                normaliseOrganisationProfile(
                    savedOrganisation
                ),

            version:
                saved.version,

        });


    } catch (err) {

        console.error(
            "[PROFILE PUT] FAILED:",
            err
        );


        return res.status(500).json({

            error:
                "Profile save failed",

            detail:
                err.message,

        });

    }

}