import {
    DEFAULT_PHONE_COUNTRY,
    PHONE_COUNTRIES,
    IDENTITY_TYPES,
} from "./profileConstants";


/* =====================================
   PROFILE SECTION COMPLETION
===================================== */

export function calculateProfileSectionCompletion(
    values = {},
    sectionId = ""
) {

    let checks = [];


    switch (sectionId) {

        /* =====================================
           IDENTITY
        ===================================== */

        case "identity":

            checks = [

                Boolean(
                    values.username
                ),

            ];

            break;


        /* =====================================
           LOCATION
        ===================================== */

        case "location":

            checks = [

                Boolean(
                    values.homeLocation
                ),

            ];

            break;


        /* =====================================
           CONTACT
        ===================================== */

        case "contact":

            checks = [

                Boolean(
                    values.phoneDisplay
                ),

            ];

            break;


        /* =====================================
           SOCIAL
        ===================================== */

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


        /* =====================================
           PAYMENT
        ===================================== */

        case "payment":

            checks = [

                Boolean(
                    values.payment?.verified
                ),

            ];

            break;


        /* =====================================
           ENTITY
        ===================================== */

        case "entity":

            checks = [

                Boolean(
                    values.entity?.name
                ),

                Boolean(
                    values.entity?.website
                ),

            ];

            break;


        case "entity-address":

            checks = [

                Boolean(
                    values.entity?.streetAddress
                ),

                Boolean(
                    values.entity?.suburb
                ),

                Boolean(
                    values.entity?.postcode
                ),

            ];

            break;


        case "entity-contact":

            checks = [

                Boolean(
                    values.entity?.phone
                ),

                Boolean(
                    values.entity?.email
                ),

            ];

            break;


        /* =====================================
           DEFAULT
        ===================================== */

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

function getUserEmail(user) {

    return (
        user?.email ||
        user?.attributes?.email ||
        user?.signInDetails?.loginId ||
        ""
    );

}

/* =====================================
   INITIAL PROFILE VALUES
===================================== */

export function getInitialProfileValues({
    profile,
    user,
}) {

    const email =
        getUserEmail(user);


    const profileData =
        profile || {};


    /* =========================================
       ENTITY SOURCE
    ========================================= */

    const persistedEntity =
        profileData.entity ||
        profileData.entityProfile ||
        profileData.organisationProfile ||
        {};


    const entity = {

        name:
            persistedEntity.name ||
            persistedEntity.organisation_name ||
            "",

        classification:
            persistedEntity.classification ||
            "",

        website:
            persistedEntity.website ||
            "",

        streetAddress:
            persistedEntity.streetAddress ||
            persistedEntity.street_address ||
            "",

        suburb:
            persistedEntity.suburb ||
            "",

        postcode:
            persistedEntity.postcode ||
            "",

        phone:
            persistedEntity.phone ||
            persistedEntity.organisation_phone ||
            "",

        email:
            persistedEntity.email ||
            persistedEntity.organisation_email ||
            "",

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
            persistedEntity.source ||
            "manual",

    };


    /* =========================================
       RETURN
    ========================================= */

    return {

        username:
            profileData.username ||
            email.split("@")[0] ||
            "",

        displayName:
            profileData.displayName ||
            profileData.display_name ||
            "",

        email:
            profileData.email ||
            email,

        userType:
            profileData.userType ||
            profileData.user_type ||
            "PERSONAL",

        identityType:
            profileData.identityType ||
            (
                profileData.userType === "ENTITY" ||
                profileData.user_type === "ENTITY"
                    ? "ENTITY"
                    : "PERSONAL"
            ),

        phoneCountry:
            profileData.phoneCountry ||
            "AU",

        phoneDisplay:
            profileData.phoneDisplay ||
            "",

        phoneE164:
            profileData.phoneE164 ||
            profileData.phone ||
            "",

        homeLocation:
            profileData.homeLocation ||
            null,

        entity,

        policies:
            profileData.policies || {

                communityStandards: false,

                creatorGuidelines: false,

                marketplacePolicies: false,

                participationFramework: false,

            },

        payment:
            profileData.payment || {

                cardName: "",

                last4: "",

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

        email
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
   PHONE
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
        value
            .replace(/\D/g, "")
            .replace(/^0+/, "");


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
        phone
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