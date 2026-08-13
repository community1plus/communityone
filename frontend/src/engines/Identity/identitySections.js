import {
    validatePhone,
} from "../../framework/Workspace/profile/profileHelpers";

import LocationSection
    from "../Location/sections/LocationSection";

import {
    createWorkspaceSectionModel,
} from "../../framework/Workspace/models/WorkspaceSectionModel";

import IdentitySection
    from "../Identity/sections/IdentitySection";

export const IDENTITY_SECTIONS = [

    createWorkspaceSectionModel({

        id: "identity",

        title: "Identity",

        component: IdentitySection,

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

    title: "Location",

    component: LocationSection,

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

    title: "Contact",

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

//
createWorkspaceSectionModel({
    id: "social",
    title: "Social",
    view: "social",
    fields: [],
}),


    createWorkspaceSectionModel({

        id: "payment",

        title: "Payment",

        view: "form",

        fields: [],

    }),

];


/* =========================================
   ENTITY PROFILE
========================================= */

export const ENTITY_SECTIONS = [

    createWorkspaceSectionModel({

        id: "organisation",

        title: "Organisation",

        view: "form",

        fields: [

            {
                name: "organisation.name",

                label: "Organisation Name",

                type: "text",
            },

            {
                name: "organisation.website",

                label: "Website",

                type: "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "organisation-address",

        title: "Address",

        view: "form",

        fields: [

            {
                name: "organisation.streetAddress",

                label: "Street Address",

                type: "text",
            },

            {
                name: "organisation.suburb",

                label: "Suburb",

                type: "text",
            },

            {
                name: "organisation.postcode",

                label: "Postcode",

                type: "text",
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "organisation-contact",

        title: "Contact",

        view: "form",

        fields: [

            {
                name: "organisation.phone",

                label: "Phone",

                type: "text",
            },

            {
                name: "organisation.email",

                label: "Email",

                type: "email",

                readOnly: true,
            },

        ],

    }),


    createWorkspaceSectionModel({

        id: "social",

        title: "Social",

        view: "form",

        fields: [],

    }),


    createWorkspaceSectionModel({

        id: "payment",

        title: "Payment",

        view: "form",

        fields: [],

    }),

];


/* =========================================
   COMMUNITY POLICIES
========================================= */

export const COMMUNITY_POLICY_STEPS = [

    createWorkspaceSectionModel({

        id: "community-policies",

        title: "Community Policies",

        view: "form",

        fields: [],

    }),

];