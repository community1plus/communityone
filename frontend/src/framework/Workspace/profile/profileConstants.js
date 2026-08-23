import {
    validatePhone,
} from "../../framework/Workspace/profile/profileHelpers";

import {
    createWorkspaceSectionModel,
} from "../models/WorkspaceSectionModel";


/* =========================================
   PHONE
========================================= */

export const DEFAULT_PHONE_COUNTRY = "AU";


export const PHONE_COUNTRIES = [

    {
        code: "AU",
        label: "Australia",
        dialCode: "+61",
        min: 9,
        max: 9,
    },

    {
        code: "NZ",
        label: "New Zealand",
        dialCode: "+64",
        min: 8,
        max: 9,
    },

    {
        code: "US",
        label: "United States",
        dialCode: "+1",
        min: 10,
        max: 10,
    },

];


/* =========================================
   IDENTITY TYPES
========================================= */

export const IDENTITY_TYPES = {

    PERSONAL:
        "PERSONAL",

    ENTITY:
        "ENTITY",

};


/* =========================================
   PROFILE MODES
========================================= */

export const PROFILE_MODES = {

    PERSON:
        "PERSON",

    ENTITY:
        "ENTITY",

};


/* =========================================
   PROFILE STEPS
========================================= */

/*
 * These are workspace navigation steps.
 *
 * The step model is declarative.
 * Runtime state is added later by
 * createWorkspaceRuntime().
 */


/* =========================================
   PERSONAL
========================================= */

export const PERSONAL_STEPS = [

    createWorkspaceSectionModel({

        id:
            "identity",

        title:
            "Identity",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "username",

                label:
                    "Name",

                type:
                    "text",

                helperText:
                    "This is how people know you in Community One.",
            },

            {
                name:
                    "email",

                label:
                    "Email",

                type:
                    "email",

                readOnly:
                    true,
            },

        ],

    }),


    createWorkspaceSectionModel({

        id:
            "location",

        title:
            "Location",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "homeLocation",

                label:
                    "Home Address",

                type:
                    "location",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id:
            "contact",

        title:
            "Contact",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "phoneDisplay",

                label:
                    "Phone Number",

                type:
                    "phone",
            },

        ],

        validator:
            (values) => {

                return validatePhone(

                    values.phoneDisplay || "",

                    values.phoneCountry

                );

            },

    }),

];


/*
 * Backwards compatibility.
 *
 * Existing code can continue importing
 * PERSONAL_SECTIONS while the framework
 * moves toward "steps".
 */

export const PERSONAL_SECTIONS =
    PERSONAL_STEPS;


/* =========================================
   ENTITY
========================================= */

export const ENTITY_STEPS = [

    createWorkspaceSectionModel({

        id:
            "entity",

        title:
            "Entity",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "entity.name",

                label:
                    "Entity Name",

                type:
                    "text",
            },

            {
                name:
                    "entity.website",

                label:
                    "Website",

                type:
                    "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id:
            "entity-address",

        title:
            "Address",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "entity.streetAddress",

                label:
                    "Street Address",

                type:
                    "text",
            },

            {
                name:
                    "entity.suburb",

                label:
                    "Suburb",

                type:
                    "text",
            },

            {
                name:
                    "entity.postcode",

                label:
                    "Postcode",

                type:
                    "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id:
            "entity-contact",

        title:
            "Contact",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields: [

            {
                name:
                    "entity.phone",

                label:
                    "Phone",

                type:
                    "text",
            },

            {
                name:
                    "entity.email",

                label:
                    "Email",

                type:
                    "email",

                readOnly:
                    true,
            },

        ],

    }),

];


export const ENTITY_SECTIONS =
    ENTITY_STEPS;


/* =========================================
   COMMON
========================================= */

export const COMMON_STEPS = [

    createWorkspaceSectionModel({

        id:
            "social",

        title:
            "Social",

        view:
            "social",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields:
            [],

    }),


    createWorkspaceSectionModel({

        id:
            "payment",

        title:
            "Payment",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields:
            [],

    }),

];


export const COMMON_SECTIONS =
    COMMON_STEPS;


/* =========================================
   COMMUNITY POLICY
========================================= */

export const COMMUNITY_POLICY_STEPS = [

    createWorkspaceSectionModel({

        id:
            "community-policies",

        title:
            "Community Policies",

        view:
            "form",

        actions: [

            "edit",
            "clear",
            "reset",
            "save",

        ],

        fields:
            [],

    }),

];


export const COMMUNITY_POLICY_SECTIONS =
    COMMUNITY_POLICY_STEPS;


/* =========================================
   PROFILE STEP COLLECTIONS
========================================= */

export const PROFILE_STEPS = {

    PERSONAL:
        PERSONAL_STEPS,

    ENTITY:
        ENTITY_STEPS,

    COMMON:
        COMMON_STEPS,

    COMMUNITY_POLICIES:
        COMMUNITY_POLICY_STEPS,

};


/* =========================================
   PROFILE TABS
========================================= */

/*
 * Kept as a compatibility model.
 *
 * The workspace navigation itself should now
 * come from the step models.
 */

export const PROFILE_TABS = [

    {
        id:
            "PERSON",

        label:
            "Person",
    },

    {
        id:
            "ENTITY",

        label:
            "Entity",
    },

    {
        id:
            "COMMUNITY_POLICIES",

        label:
            "Community Policies",
    },

];


/* =========================================
   PROFILE CARD TITLES
========================================= */

export const PROFILE_CARD_TITLES = {

    identity:
        "Identity",

    location:
        "Location",

    contact:
        "Contact",

    social:
        "Connected Accounts",

    payment:
        "Payment Method",

    entity:
        "Entity",

    "entity-address":
        "Entity Address",

    "entity-contact":
        "Entity Contact",

    "community-policies":
        "Community Policies",

};


/* =========================================
   PROFILE STEP IDS
========================================= */

export const PROFILE_SECTIONS = {

    IDENTITY:
        "identity",

    LOCATION:
        "location",

    CONTACT:
        "contact",

    SOCIAL:
        "social",

    PAYMENT:
        "payment",

    ENTITY:
        "entity",

    ENTITY_ADDRESS:
        "entity-address",

    ENTITY_CONTACT:
        "entity-contact",

    COMMUNITY_POLICIES:
        "community-policies",

};


/*
 * New framework vocabulary.
 *
 * PROFILE_SECTIONS remains above for compatibility.
 */

export const PROFILE_STEP_IDS =
    PROFILE_SECTIONS;


/* =========================================
   SOCIAL PROVIDERS
========================================= */

export const SOCIAL_PROVIDERS = {

    FACEBOOK:
        "facebook",

    INSTAGRAM:
        "instagram",

    YOUTUBE:
        "youtube",

    X:
        "x",

};