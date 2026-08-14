import {
    DEFAULT_PHONE_COUNTRY,
    PHONE_COUNTRIES,
} from "./profileConstants";


/* =====================================
   PROFILE COMPLETION
===================================== */

export function calculateProfileCompletion(values) {

    const socialVerified =
        Object.values(
            values.social || {}
        ).some(
            account =>
                account?.verified === true
        );


    const checks = [

        Boolean(values.username),

        Boolean(values.homeLocation),

        Boolean(values.phoneDisplay),

        socialVerified,

        Boolean(values.payment?.verified),

    ];


    const completed =
        checks.filter(Boolean).length;


    return Math.round(
        (completed / checks.length) * 100
    );

}


/* =====================================
   INITIAL PROFILE VALUES
===================================== */

export function getInitialProfileValues(
    profile,
    user
) {

    const email =
        user?.email || "";


    const emailUsername =
        email
            .split("@")[0]
            .toLowerCase();


    /*
       Keep ORG as the backend/profile
       userType for now.
    */

    const userType =
        profile?.userType || "PERSONAL";


    const isEntity =
        userType === "ORG" ||
        userType === "MIXED";


    return {

        /* =====================================
           IDENTITY
        ===================================== */

        username:
            profile?.username ||
            emailUsername,

        email,


        capabilities: {

            personal:
                !isEntity,

            entity:
                isEntity,

        },


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
    code
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