import {
    DEFAULT_PHONE_COUNTRY,
    PHONE_COUNTRIES,
    IDENTITY_TYPES,
} from "./profileConstants";


/* =====================================
   STRING
===================================== */

function cleanString(value = "") {

    return String(
        value ?? ""
    ).trim();

}


/* =====================================
   PROFILE SECTION COMPLETION
===================================== */

export function calculateProfileSectionCompletion(
    values = {},
    sectionId = ""
) {

    let checks = [];


    switch (sectionId) {

        case "identity":

            checks = [
                Boolean(
                    cleanString(
                        values.username
                    )
                ),
            ];

            break;


        case "location":

            checks = [
                Boolean(
                    values.homeLocation
                ),
            ];

            break;


        case "contact":

            checks = [
                Boolean(
                    cleanString(
                        values.phoneDisplay
                    )
                ),
            ];

            break;


        case "social":

            checks = [
                Object.values(
                    values.social || {}
                ).some(
                    account =>
                        account?.verified === true
                ),
            ];

            break;


        case "payment":

            checks = [
                Boolean(
                    values.payment?.verified
                ),
            ];

            break;


        case "entity":

            checks = [
                Boolean(
                    cleanString(
                        values.entity?.name
                    )
                ),

                Boolean(
                    cleanString(
                        values.entity?.website
                    )
                ),
            ];

            break;


        case "entity-address":

            checks = [
                Boolean(
                    cleanString(
                        values.entity?.streetAddress
                    )
                ),

                Boolean(
                    cleanString(
                        values.entity?.suburb
                    )
                ),

                Boolean(
                    cleanString(
                        values.entity?.postcode
                    )
                ),
            ];

            break;


        case "entity-contact":

            checks = [
                Boolean(
                    cleanString(
                        values.entity?.phone
                    )
                ),

                Boolean(
                    cleanString(
                        values.entity?.email
                    )
                ),
            ];

            break;


        default:

            return 0;

    }


    const completed =
        checks.filter(
            Boolean
        ).length;


    return checks.length
        ? Math.round(
            (
                completed /
                checks.length
            ) * 100
        )
        : 0;

}


/* =====================================
   PROFILE COMPLETION
===================================== */

export function calculateProfileCompletion(
    values = {}
) {

    const sectionIds = [

        "identity",
        "location",
        "contact",
        "social",
        "payment",

    ];


    const sectionCompletions =
        sectionIds.map(
            sectionId =>
                calculateProfileSectionCompletion(
                    values,
                    sectionId
                )
        );


    const completedSections =
        sectionCompletions.filter(
            completion =>
                completion === 100
        ).length;


    return Math.round(
        (
            completedSections /
            sectionIds.length
        ) * 100
    );

}


/* =====================================
   USER EMAIL
===================================== */

function getUserEmail(user) {

    return cleanString(

        user?.email ||

        user?.attributes?.email ||

        user?.signInDetails?.loginId ||

        ""

    );

}


/* =====================================
   ENTITY
===================================== */

function buildInitialEntity(
    profile = {}
) {

    const persistedEntity =

        profile.entity ||

        profile.entityProfile ||

        profile.organisationProfile ||

        profile.organisation ||

        {};


    return {

        name:
            cleanString(
                persistedEntity.name ||
                persistedEntity.organisation_name
            ),

        classification:
            cleanString(
                persistedEntity.classification
            ),

        website:
            cleanString(
                persistedEntity.website
            ),

        streetAddress:
            cleanString(
                persistedEntity.streetAddress ||
                persistedEntity.street_address
            ),

        suburb:
            cleanString(
                persistedEntity.suburb
            ),

        postcode:
            cleanString(
                persistedEntity.postcode
            ),

        phone:
            cleanString(
                persistedEntity.phone ||
                persistedEntity.organisation_phone
            ),

        email:
            cleanString(
                persistedEntity.email ||
                persistedEntity.organisation_email
            ),

        location:
            persistedEntity.location ||
            null,

        emailVerified:
            Boolean(
                persistedEntity.emailVerified ??
                persistedEntity.email_verified
            ),

        ownershipVerified:
            Boolean(
                persistedEntity.ownershipVerified ??
                persistedEntity.ownership_verified
            ),

        source:
            cleanString(
                persistedEntity.source
            ) ||
            "manual",

    };

}


/* =====================================
   IDENTITY TYPE
===================================== */

function resolveIdentityType(
    profile
) {

    if (
        profile?.identityType
    ) {

        return profile.identityType;

    }


    if (
        profile?.identity_type
    ) {

        return profile.identity_type;

    }


    if (
        profile?.userType ===
            IDENTITY_TYPES.ENTITY ||

        profile?.user_type ===
            IDENTITY_TYPES.ENTITY
    ) {

        return IDENTITY_TYPES.ENTITY;

    }


    return IDENTITY_TYPES.PERSONAL;

}


/* =====================================
   USER TYPE
===================================== */

function resolveUserType(
    profile
) {

    return (

        profile?.userType ||

        profile?.user_type ||

        "PERSONAL"

    );

}


/* =====================================
   INITIAL PROFILE VALUES
===================================== */

export function getInitialProfileValues({
    profile,
    user,
} = {}) {

    const profileData =
        profile || {};


    /* -------------------------------------
       ACCOUNT IDENTITY
    ------------------------------------- */

    const accountEmail =
        getUserEmail(
            user
        );


    const profileEmail =
        cleanString(
            profileData.email
        );


    const email =
        profileEmail ||
        accountEmail;


    const username =
        cleanString(
            profileData.username
        ) ||

        (
            email.includes("@")
                ? email.split("@")[0]
                : ""
        );


    const displayName =
        cleanString(
            profileData.displayName ||
            profileData.display_name
        );


    /* -------------------------------------
       ENTITY
    ------------------------------------- */

    const entity =
        buildInitialEntity(
            profileData
        );


    /* -------------------------------------
       PROFILE VALUES
    ------------------------------------- */

    return {

        /* =================================
           IDENTITY
        ================================= */

        username,

        displayName,

        email,


        /* =================================
           ACCOUNT TYPE
        ================================= */

        userType:
            resolveUserType(
                profileData
            ),

        identityType:
            resolveIdentityType(
                profileData
            ),


        /* =================================
           PHONE
        ================================= */

        phoneCountry:
            profileData.phoneCountry ||
            profileData.phone_country ||
            DEFAULT_PHONE_COUNTRY,

        phoneDisplay:
            cleanString(
                profileData.phoneDisplay ||
                profileData.phone_display
            ),

        phoneE164:
            cleanString(
                profileData.phoneE164 ||
                profileData.phone_e164 ||
                profileData.phone
            ),


        /* =================================
           LOCATION
        ================================= */

        homeLocation:
            profileData.homeLocation ||
            profileData.home_location ||
            null,


        /* =================================
           ENTITY
        ================================= */

        entity,


        /* =================================
           SOCIAL
        ================================= */

        social:
            profileData.social ||
            {},


        /* =================================
           PAYMENT
        ================================= */

        payment:
            profileData.payment ||
            {
                cardName: "",
                last4: "",
            },


        /* =================================
           POLICIES
        ================================= */

        policies:
            profileData.policies ||
            {
                communityStandards: false,
                creatorGuidelines: false,
                marketplacePolicies: false,
                participationFramework: false,
            },

    };

}


/* =====================================
   EMAIL
===================================== */

export function getEmailDomain(
    email = ""
) {

    return (
        cleanString(email)
            .split("@")[1]
            ?.toLowerCase()
        ||
        ""
    );

}


/* =====================================
   PHONE COUNTRY
===================================== */

export function getPhoneCountry(
    code = DEFAULT_PHONE_COUNTRY
) {

    return (

        PHONE_COUNTRIES.find(
            country =>
                country.code === code
        )

        ||

        PHONE_COUNTRIES.find(
            country =>
                country.code ===
                DEFAULT_PHONE_COUNTRY
        )

    );

}


/* =====================================
   PHONE → E.164
===================================== */

export function toE164Phone(
    value = "",
    countryCode = DEFAULT_PHONE_COUNTRY
) {

    const country =
        getPhoneCountry(
            countryCode
        );


    if (!country) {
        return "";
    }


    const digits =
        cleanString(
            value
        )
            .replace(
                /\D/g,
                ""
            )
            .replace(
                /^0+/,
                ""
            );


    if (!digits) {
        return "";
    }


    return (
        `${country.dialCode}${digits}`
    );

}


/* =====================================
   PHONE VALIDATION
===================================== */

export function validatePhone(
    phone = "",
    countryCode = DEFAULT_PHONE_COUNTRY
) {

    const country =
        getPhoneCountry(
            countryCode
        );


    if (!country) {
        return false;
    }


    const digits =
        cleanString(
            phone
        )
            .replace(
                country.dialCode,
                ""
            )
            .replace(
                /\D/g,
                ""
            );


    return (

        digits.length >=
            country.min

        &&

        digits.length <=
            country.max

    );

}