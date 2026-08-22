import {
    validatePhone,
} from "../../framework/Workspace/profile/profileHelpers";

import {
    createWorkspaceSectionModel,
} from "../../framework/Workspace/models/WorkspaceSectionModel";


/* =========================================
   PERSONAL SECTIONS
========================================= */

export const PERSONAL_SECTIONS = [

    createWorkspaceSectionModel({

        id: "IDENTITY",

        title: "IDENTITY",

        view: "form",

        fields: [

            {
                name: "username",

                label: "Name",

                type: "text",

                helperText:
                    "This is how people know you in Community One.",
            },

            {
                name: "email",

                label: "Email",

                type: "email",

                readOnly: true,
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "location",

        title: "LOCATION",

        view: "form",

        fields: [

            {
                name: "homeLocation",

                label: "Home Address",

                type: "location",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "contact",

        title: "CONTACT",

        view: "form",

        fields: [

            {
                name: "phoneDisplay",

                label: "Phone Number",

                type: "phone",
            },

        ],

        validator: (values) => {

            return validatePhone(

                values.phoneDisplay || "",

                values.phoneCountry

            );

        },

    }),

];


/* =========================================
   ENTITY SECTIONS
========================================= */

export const ENTITY_SECTIONS = [

    createWorkspaceSectionModel({

        id: "entity",

        title: "Entity",

        view: "form",

        fields: [

            {
                name: "entity.name",

                label: "Entity Name",

                type: "text",
            },

            {
                name: "entity.website",

                label: "Website",

                type: "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "entity-address",

        title: "Address",

        view: "form",

        fields: [

            {
                name: "entity.streetAddress",

                label: "Street Address",

                type: "text",
            },

            {
                name: "entity.suburb",

                label: "Suburb",

                type: "text",
            },

            {
                name: "entity.postcode",

                label: "Postcode",

                type: "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "entity-contact",

        title: "Contact",

        view: "form",

        fields: [

            {
                name: "entity.phone",

                label: "Phone",

                type: "text",
            },

            {
                name: "entity.email",

                label: "Email",

                type: "email",

                readOnly: true,
            },

        ],

    }),

];


/* =========================================
   COMMON SECTIONS
========================================= */

export const COMMON_SECTIONS = [

    createWorkspaceSectionModel({

        id: "social",

        title: "SOCIAL",

        view: "social",

        fields: [],

    }),


    createWorkspaceSectionModel({

        id: "payment",

        title: "PAYMENT",

        view: "form",

        fields: [],

    }),

];


/* =========================================
   COMMUNITY POLICIES
========================================= */

export const COMMUNITY_POLICY_SECTIONS = [

    createWorkspaceSectionModel({

        id: "community-policies",

        title: "Community Policies",

        view: "form",

        fields: [],

    }),

];