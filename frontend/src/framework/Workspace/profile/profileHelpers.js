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

    const emailPrefix =
        email.split("@")[0] || "";


    const entity =
        profile?.entity || {};


    return {

        username:
            profile?.username ||
            emailPrefix,

        display_name:
            profile?.display_name ||
            profile?.displayName ||
            emailPrefix,

        email:
            profile?.email ||
            email,

        userType:
            profile?.userType ||
            profile?.user_type ||
            "PERSONAL",


        phoneCountry:
            profile?.phoneCountry ||
            "AU",

        phoneDisplay:
            profile?.phoneDisplay ||
            "",

        phoneE164:
            profile?.phoneE164 ||
            profile?.phone ||
            "",


        homeLocation:
            profile?.homeLocation ||
            null,


        /* =====================================
           ENTITY
        ===================================== */

        entity: {

            name:
                entity.name ||
                "",

            classification:
                entity.classification ||
                "",

            website:
                entity.website ||
                "",

            streetAddress:
                entity.streetAddress ||
                "",

            suburb:
                entity.suburb ||
                "",

            postcode:
                entity.postcode ||
                "",

            phone:
                entity.phone ||
                "",

            phoneE164:
                entity.phoneE164 ||
                "",

            email:
                entity.email ||
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

        },


        policies:
            profile?.policies || {},


        payment:
            profile?.payment || {},

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