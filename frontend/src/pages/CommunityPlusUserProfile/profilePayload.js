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

    const identityType =
        values.identityType ||
        values.userType ||
        "PERSONAL";


    const isEntity =
        identityType === "ENTITY";


    /* =========================================
       PHONE
    ========================================= */

    const phoneE164 =
        toE164Phone(
            values.phoneDisplay,
            values.phoneCountry
        );


    /* =========================================
       ENTITY
    ========================================= */

    const entity =
        values.entity || {};


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

        display_name:
            values.display_name ||
            values.displayName ||
            "",

        email:
            values.email ||
            userEmail ||
            "",

        userType:
            identityType,

        user_type:
            identityType,

        identityType,

        profileLevel:
            1,

        profile_level:
            1,

        phone:
            phoneE164,

        phoneE164,

        phoneDisplay:
            values.phoneDisplay || "",

        phoneCountry:
            values.phoneCountry || "AU",

        homeLocation:
            isEntity
                ? null
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

    if (isEntity) {

        profile.entity = {

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
                entity.phone || "",

            email:
                entity.email || "",

        };

    }


    /* =========================================
       RETURN
    ========================================= */

    return {

        profile,

    };

}