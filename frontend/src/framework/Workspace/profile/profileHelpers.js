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

        case "identity":

            checks = [

                Boolean(values.username),

            ];

            break;


        case "location":

            checks = [

                Boolean(values.homeLocation),

            ];

            break;


        case "contact":

            checks = [

                Boolean(values.phoneDisplay),

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


        default:

            return 0;

    }


    const completed =
        checks.filter(Boolean).length;


    return checks.length
        ? Math.round(
            (completed / checks.length) * 100
        )
        : 0;

}

export function calculateProfileCompletion(values = {}) {

    const sections =
        calculateProfileSectionCompletion(
            values
        );


    const checks =
        Object.values(
            sections
        );


    const completed =
        checks.filter(Boolean).length;


    return checks.length
        ? Math.round(
            (completed / checks.length) * 100
        )
        : 0;

}

/* =====================================
   PROFILE COMPLETION
===================================== */


/* =====================================
   INITIAL PROFILE VALUES
===================================== */

export function getInitialProfileValues(
    profile = {},
    user = {}
) {

    const email =
        user?.email || "";


    const emailUsername =
        email
            .split("@")[0]
            .toLowerCase();


    /*
       -------------------------------------
       PROFILE USERNAME

       Important:

       An empty username is a valid saved
       profile state.

       Do NOT use:

           profile?.username || emailUsername

       because "" is falsy and would cause
       the authentication email username to
       be restored.

       Only use the email username when the
       profile has never contained a username.
       -------------------------------------
    */

    const hasProfileUsername =
        Object.prototype.hasOwnProperty.call(
            profile,
            "username"
        );


    const profileUsername =
        hasProfileUsername
            ? profile.username
            : emailUsername;


    /*
       -------------------------------------
       IDENTITY TYPE

       New model:

       PERSONAL
       ENTITY

       Legacy ORG is temporarily mapped to
       ENTITY for backward compatibility.
       -------------------------------------
    */

    const identityType =
        profile?.identityType
        ||
        (
            profile?.userType === "ORG"
                ? IDENTITY_TYPES.ENTITY
                : IDENTITY_TYPES.PERSONAL
        );


    return {

        /* =====================================
           ACTIVE IDENTITY
        ===================================== */

        activeIdentityType:
            identityType,


        /* =====================================
           PERSONAL IDENTITY
        ===================================== */

        personalIdentity: {

            username:
                profileUsername,

            email,

            phoneCountry:
                profile?.phoneCountry ||
                DEFAULT_PHONE_COUNTRY,

            phoneDisplay:
                profile?.phoneDisplay ||
                "",

            homeLocation:
                profile?.homeLocation ||
                null,

        },


        /* =====================================
           FORMAL ENTITIES
        ===================================== */

        entities:
            profile?.entities ||
            [],


        /* =====================================
           IDENTITY
           
           Temporary compatibility fields.

           These allow the existing Workspace
           fields to continue working while
           the profile state is migrated.
        ===================================== */

        username:
            profileUsername,

        email,


        /* =====================================
           CONTACT
        ===================================== */

        phoneCountry:
            profile?.phoneCountry ||
            DEFAULT_PHONE_COUNTRY,

        phoneDisplay:
            profile?.phoneDisplay ||
            "",


        /* =====================================
           LOCATION
        ===================================== */

        homeLocation:
            profile?.homeLocation ||
            null,


        /* =====================================
           SOCIAL
        ===================================== */

        social: {

            facebook: {

                connected:
                    profile?.social?.facebook?.connected ||
                    false,

                username:
                    profile?.social?.facebook?.username ||
                    "",

                verified:
                    profile?.social?.facebook?.verified ||
                    false,

            },


            instagram: {

                connected:
                    profile?.social?.instagram?.connected ||
                    false,

                username:
                    profile?.social?.instagram?.username ||
                    "",

                verified:
                    profile?.social?.instagram?.verified ||
                    false,

            },


            youtube: {

                connected:
                    profile?.social?.youtube?.connected ||
                    false,

                username:
                    profile?.social?.youtube?.username ||
                    "",

                verified:
                    profile?.social?.youtube?.verified ||
                    false,

            },


            x: {

                connected:
                    profile?.social?.x?.connected ||
                    false,

                username:
                    profile?.social?.x?.username ||
                    "",

                verified:
                    profile?.social?.x?.verified ||
                    false,

            },

        },


        /* =====================================
           PAYMENT
        ===================================== */

        payment: {

            verified:
                profile?.payment?.verified ||
                false,

        },


        /* =====================================
           ENTITY
        ===================================== */

        entity: {

            name:
                profile?.entity?.name ||
                profile?.organisation?.name ||
                "",

            website:
                profile?.entity?.website ||
                profile?.organisation?.website ||
                "",

            streetAddress:
                profile?.entity?.streetAddress ||
                profile?.organisation?.streetAddress ||
                "",

            suburb:
                profile?.entity?.suburb ||
                profile?.organisation?.suburb ||
                "",

            postcode:
                profile?.entity?.postcode ||
                profile?.organisation?.postcode ||
                "",

            phone:
                profile?.entity?.phone ||
                profile?.organisation?.phone ||
                "",

            email:
                profile?.entity?.email ||
                profile?.organisation?.email ||
                "",

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
            ?.toLowerCase() ||

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