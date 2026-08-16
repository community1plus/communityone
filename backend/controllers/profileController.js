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


async function fetchOrganisationByProfileId(
    userProfileId
) {

    if (!userProfileId) {
        return null;
    }

const userId = getUserId(req);

console.log(
    "[PROFILE PATCH] req.user:",
    JSON.stringify(req.user, null, 2)
);

console.log(
    "[PROFILE PATCH] resolved userId:",
    userId
);


const result = await pool.query(
    `
    SELECT id, user_id, username
    FROM user_profiles
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
);

console.log(
    "[PROFILE PATCH] DIRECT DB RESULT:",
    result.rows
);


const existing =
    await fetchProfileByUserId(userId);

console.log(
    "[PROFILE PATCH] REPOSITORY RESULT:",
    existing
);

    return result.rows[0] || null;

}


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
            Boolean(org.email_verified),

        phoneVerified:
            Boolean(org.phone_verified),

        ownershipVerified:
            Boolean(org.ownership_verified),

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