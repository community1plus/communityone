import {
    toE164Phone,
} from "../../../src/framework/Workspace/profile/profileHelpers";


/* =========================================================
   HELPERS
========================================================= */

function buildPhone({
    phone,
    country,
}) {
    const display =
        phone || "";

    return {
        display,
        e164:
            toE164Phone(
                display,
                country
            ),
    };
}


function buildEntity({
    entity,
}) {
    if (!entity) {
        return null;
    }

    const phone =
        buildPhone({
            phone:
                entity.phone,
            country:
                entity.phoneCountry ||
                "AU",
        });

    return {

        name:
            entity.name || "",

        classification:
            entity.classification || "",

        website:
            entity.website || "",

        streetAddress:
            entity.streetAddress || "",

        suburb:
            entity.suburb || "",

        postcode:
            entity.postcode || "",

        phone:
            phone.e164,

        email:
            entity.email || "",

        location:
            entity.location ||
            null,

        source:
            entity.source ||
            "manual",

    };
}


function buildOrganisationProfile({
    entity,
    sourceValues,
}) {
    if (!entity) {
        return null;
    }

    return {

        organisation_name:
            entity.name,

        organisation_email:
            entity.email,

        organisation_phone:
            entity.phone,

        website:
            entity.website,

        location:
            entity.location,

        classification:
            entity.classification,

        streetAddress:
            entity.streetAddress,

        suburb:
            entity.suburb,

        postcode:
            entity.postcode,

        email_verified:
            Boolean(
                sourceValues
                    ?.entity
                    ?.emailVerified
            ),

        ownership_verified:
            Boolean(
                sourceValues
                    ?.entity
                    ?.ownershipVerified
            ),

        business_level:
            1,

        source:
            entity.source,

    };
}


/* =========================================================
   PROFILE PAYLOAD
========================================================= */

export function buildProfilePayload({

    values,

    userEmail,

    homeLocation,

}) {

    /* =====================================================
       IDENTITY
    ===================================================== */

    const userType =
        values.userType ||
        "PERSONAL";


    const identityType =
        values.identityType ||
        "PERSONAL";


    const isEntity =
        identityType === "ENTITY";


    /* =====================================================
       PHONE
    ===================================================== */

    const personalPhone =
        buildPhone({
            phone:
                values.phoneDisplay,
            country:
                values.phoneCountry ||
                "AU",
        });


    const entitySource =
        values.entity || null;


    const entity =
        isEntity
            ? buildEntity({
                entity:
                    entitySource,
            })
            : null;


    /* =====================================================
       PROFILE
    ===================================================== */

    const profile = {

        username:
            values.username ||
            "",

        displayName:
            values.displayName ||
            values.display_name ||
            "",

        email:
            values.email ||
            userEmail ||
            "",

        userType,

        identityType,

        profileLevel:
            1,

        phone:
            isEntity
                ? entity?.phone || ""
                : personalPhone.e164,

        phoneE164:
            isEntity
                ? entity?.phone || ""
                : personalPhone.e164,

        phoneDisplay:
            isEntity
                ? entity?.phone || ""
                : values.phoneDisplay ||
                  "",

        phoneCountry:
            values.phoneCountry ||
            "AU",

        homeLocation:
            isEntity
                ? (
                    entity?.location ||
                    values.homeLocation ||
                    homeLocation ||
                    null
                )
                : (
                    values.homeLocation ||
                    homeLocation ||
                    null
                ),

        policies:
            values.policies,

        payment:
            values.payment,

    };


    /* =====================================================
       LEGACY API COMPATIBILITY
    ===================================================== */

    const organisationProfile =
        buildOrganisationProfile({
            entity,
            sourceValues:
                values,
        });


    /* =====================================================
       PAYLOAD
    ===================================================== */

    return {

        profile,

        entity,

        organisationProfile,

    };

}