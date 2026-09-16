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
   SOCIAL NORMALISATION
===================================== */

function normaliseSocialState(
    social = {}
) {

    return {

        facebook:
            social?.facebook &&
            typeof social.facebook === "object"
                ? {
                    ...social.facebook,

                    connected:
                        social.facebook.connected ??
                        Boolean(
                            social.facebook.verified
                        ),

                    username:
                        social.facebook.username ||
                        social.facebook.accountName ||
                        "",

                }
                : {
                    connected: false,
                    username: "",
                    verified: false,
                },


        instagram:
            social?.instagram &&
            typeof social.instagram === "object"
                ? {
                    ...social.instagram,

                    connected:
                        social.instagram.connected ??
                        Boolean(
                            social.instagram.verified
                        ),

                    username:
                        social.instagram.username ||
                        social.instagram.handle ||
                        social.instagram.pageName ||
                        "",

                }
                : {
                    connected: false,
                    username: "",
                    verified: false,
                },


        youtube:
            social?.youtube &&
            typeof social.youtube === "object"
                ? {
                    ...social.youtube,

                    connected:
                        social.youtube.connected ??
                        Boolean(
                            social.youtube.verified
                        ),

                    username:
                        social.youtube.username ||
                        social.youtube.customUrl ||
                        social.youtube.channelTitle ||
                        "",

                }
                : {
                    connected: false,
                    username: "",
                    verified: false,
                },


        x:
            social?.x &&
            typeof social.x === "object"
                ? {
                    ...social.x,

                    connected:
                        social.x.connected ??
                        Boolean(
                            social.x.verified
                        ),

                    username:
                        social.x.username ||
                        social.x.handle ||
                        "",

                }
                : {
                    connected: false,
                    username: "",
                    verified: false,
                },

    };

}
/* =====================================
   USER DISPLAY NAME
===================================== */

function getUserDisplayName(user) {

    return (

        user?.displayName ||

        user?.name ||

        user?.attributes?.name ||

        user?.attributes?.given_name ||

        getUserEmail(user)
            .split("@")[0] ||

        ""

    );

}

/* =====================================
   INITIAL PROFILE VALUES
===================================== */

/* =====================================
   INITIAL PROFILE VALUES
===================================== */

export function getInitialProfileValues({
    profile,
    user,
}) {

    /* =====================================
       USER
    ===================================== */

    const email =
        getUserEmail(user);


    const profileData =
        profile || {};


    /* =====================================
       ENTITY
    ===================================== */

    const persistedEntity =
        profileData.entity ||
        profileData.entityProfile ||
        profileData.organisationProfile ||
        {};


    const hasPersistedEntity =
        Object.keys(
            persistedEntity
        ).length > 0;


    /* =====================================
       IDENTITY TYPE

       Explicit identityType wins.

       If an Entity exists but identityType
       is absent, Entity becomes active.

       userType remains the legacy fallback.
    ===================================== */

    const explicitIdentityType =
        String(
            profileData.identityType ||
            profileData.identity_type ||
            ""
        ).toUpperCase();


    const legacyUserType =
        String(
            profileData.userType ||
            profileData.user_type ||
            ""
        ).toUpperCase();


    const identityType =

        explicitIdentityType === "ENTITY"

            ? "ENTITY"

            : explicitIdentityType === "PERSONAL"

                ? "PERSONAL"

                : hasPersistedEntity

                    ? "ENTITY"

                    : legacyUserType === "ENTITY"

                        ? "ENTITY"

                        : "PERSONAL";


    /* =====================================
       ENTITY MODEL
    ===================================== */

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


    /* =====================================
       SOCIAL
    ===================================== */

    const social =
        normaliseSocialState(
            profileData.social
        );


    /* =====================================
       PAYMENT
    ===================================== */

    const payment =
        profileData.payment ||
        {

            cardName:
                "",

            last4:
                "",

            brand:
                "",

            provider:
                "",

            verified:
                false,

            verifiedAt:
                null,

        };


    /* =====================================
       RETURN
    ===================================== */

    return {

        /* ---------------------------------
           IDENTITY
        --------------------------------- */

        username:
            profileData.username ??
            (
                email
                    .split("@")[0]
            ),

        displayName:
            profileData.displayName ||
            profileData.display_name ||
            getUserDisplayName(user),

        email:
            profileData.email ||
            email,


        /* ---------------------------------
           TYPES
        --------------------------------- */

        userType:
            profileData.userType ||
            profileData.user_type ||
            "PERSONAL",

        identityType,


        /* ---------------------------------
           PERSONAL CONTACT
        --------------------------------- */

        phoneCountry:
            profileData.phoneCountry ||
            profileData.phone_country ||
            "AU",

        phoneDisplay:
            profileData.phoneDisplay ||
            profileData.phone_display ||
            "",

        phoneE164:
            profileData.phoneE164 ||
            profileData.phone_e164 ||
            profileData.phone ||
            "",

        phoneVerified:
            Boolean(
                profileData.phoneVerified ??
                profileData.phone_verified
            ),


        /* ---------------------------------
           PERSONAL LOCATION
        --------------------------------- */

        homeLocation:
            profileData.homeLocation ||
            profileData.home_location ||
            null,


        /* ---------------------------------
           SOCIAL
        --------------------------------- */

        social,


        /* ---------------------------------
           ENTITY
        --------------------------------- */

        entity,


        /* ---------------------------------
           POLICIES
        --------------------------------- */

        policies:
            profileData.policies ||
            {},


        /* ---------------------------------
           PAYMENT
        --------------------------------- */

        payment,

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