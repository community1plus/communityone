import {
    toE164Phone,
} from "../../../src/framework/Workspace/profile/profileHelpers";


export function buildProfilePayload({

    values,

    userEmail,

    homeLocation,

}) {

    /* =========================================
       IDENTITY TYPE
    ========================================= */

    const userType =
        values.userType ||
        values.identityType ||
        "PERSONAL";


    const isEntity =
        userType === "ENTITY";


    /* =========================================
       ENTITY
    ========================================= */

    const entity =
        values.entity || {};


    /* =========================================
       ENTITY PHONE
    ========================================= */

    const entityPhoneDisplay =
        entity.phone || "";


    const entityPhoneE164 =
        toE164Phone(
            entityPhoneDisplay,
            values.phoneCountry
        );


    /* =========================================
       PERSON PHONE
    ========================================= */

    const phoneE164 =
        toE164Phone(
            values.phoneDisplay,
            values.phoneCountry
        );


    /* =========================================
       ENTITY LOCATION
    ========================================= */

    const entityLocation =
        entity.location ||
        values.homeLocation ||
        homeLocation ||
        null;


    /* =========================================
       PROFILE
    ========================================= */

    const profile = {

        username:
            values.username || "",

        displayName:
            values.displayName ||
            values.display_name ||
            "",

        email:
            values.email ||
            userEmail ||
            "",

        userType,

        profileLevel:
            1,

        phone:
            isEntity
                ? entityPhoneE164
                : phoneE164,

        phoneE164:
            isEntity
                ? entityPhoneE164
                : phoneE164,

        phoneDisplay:
            isEntity
                ? entityPhoneDisplay
                : values.phoneDisplay || "",

        phoneCountry:
            values.phoneCountry || "AU",

        homeLocation:
            isEntity
                ? entityLocation
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


    /* =========================================
       ENTITY PROFILE
    ========================================= */

    const entityProfile =
        isEntity
            ? {

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
                    entityPhoneDisplay,

                phoneE164:
                    entityPhoneE164,

                email:
                    entity.email ||
                    values.email ||
                    userEmail ||
                    "",

                location:
                    entity.location ||
                    null,

                emailVerified:
                    Boolean(
                        entity.emailVerified
                    ),

                ownershipVerified:
                    Boolean(
                        entity.ownershipVerified
                    ),

                source:
                    entity.source ||
                    "manual",

            }
            : null;


    /* =========================================
       PAYLOAD
    ========================================= */

    return {

        profile,

        entity:
            entityProfile,

    };

}