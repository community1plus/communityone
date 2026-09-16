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
       PERSONAL PHONE
    ========================================= */

    const phoneE164 =
        toE164Phone(
            values.phoneDisplay,
            values.phoneCountry
        );


    /* =========================================
       ENTITY PHONE
    ========================================= */

    const entityPhone =
        values.entity?.phone || "";

    const entityPhoneE164 =
        toE164Phone(
            entityPhone,
            values.phoneCountry
        );


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

        identityType:
            isEntity
                ? "ENTITY"
                : "PERSONAL",

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
                ? entityPhone
                : values.phoneDisplay || "",

        phoneCountry:
            values.phoneCountry || "AU",

        homeLocation:
            isEntity
                ? (
                    values.entity?.location ||
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


    /* =========================================
       ENTITY
    ========================================= */

    const entity =
        isEntity
            ? {

                name:
                    values.entity?.name ||
                    "",

                classification:
                    values.entity?.classification ||
                    "",

                website:
                    values.entity?.website ||
                    "",

                streetAddress:
                    values.entity?.streetAddress ||
                    "",

                suburb:
                    values.entity?.suburb ||
                    "",

                postcode:
                    values.entity?.postcode ||
                    "",

                phone:
                    entityPhoneE164,

                email:
                    values.entity?.email ||
                    "",

                location:
                    values.entity?.location ||
                    values.homeLocation ||
                    null,

                source:
                    values.entity?.source ||
                    "manual",

            }
            : null;


    /* =========================================
       LEGACY API COMPATIBILITY
    ========================================= */

    const organisationProfile =
        isEntity
            ? {

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
                        values.entity?.emailVerified
                    ),

                ownership_verified:
                    Boolean(
                        values.entity?.ownershipVerified
                    ),

                business_level:
                    1,

                source:
                    entity.source,

            }
            : null;


    /* =========================================
       PAYLOAD
    ========================================= */

    return {

        profile,

        entity,

        organisationProfile,

    };

}