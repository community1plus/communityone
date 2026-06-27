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
PROFILE TYPES
========================================= */

export const PROFILE_TABS = [
  {
    id: "PERSONAL",
    label: "Personal",
  },
  {
    id: "ORG",
    label: "Organisation",
  },
  {
    id: "COMMUNITY_POLICIES",
    label: "Community Policies",
  },
];

/* =========================================
PERSONAL PROFILE
========================================= */

export const PERSONAL_STEPS = [

  {
    id: "user",
    title: "User",

    fields: [

      {
        name: "displayName",
        label: "Display Name",
        type: "text",
      },

      {
        name: "username",
        label: "Username",
        type: "text",
      },

    ],
  },

  {
    id: "home",
    title: "Home Address",

    fields: [

      {
        name: "homeLocation",
        label: "Home Address",
        type: "location",
      },

    ],
  },

  {
    id: "contact",
    title: "Contact",

    fields: [

      {
        name: "phoneDisplay",
        label: "Phone Number",
        type: "text",
      },

      {
        name: "email",
        label: "Email Address",
        type: "email",
        readOnly: true,
      },

    ],
  },

  {
    id: "social",
    title: "Social",
    fields: [],
  },

  {
    id: "payment",
    title: "Payment",
    fields: [],
  },

];

/* =========================================
ORGANISATION PROFILE
========================================= */

export const ORG_STEPS = [

  {
    id: "organisation",
    title: "Organisation",

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
  },

  {
    id: "organisation-address",
    title: "Address",

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
  },
  {
    id: "organisation-contact",
    title: "Contact",

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
  },

  {
    id: "social",
    title: "Social",
    fields: [],
  },

  {
    id: "payment",
    title: "Payment",
    fields: [],
  },

];

/* =========================================
COMMUNITY POLICIES
========================================= */

export const COMMUNITY_POLICY_STEPS = [

  {
    id: "community-policies",
    title: "Community Policies",
    fields: [],
  },

];

/* =========================================
CARD TITLES
========================================= */

export const PROFILE_CARD_TITLES = {

  user: "User Details",

  home: "Home Address",

  contact: "Contact Details",

  social: "Connected Accounts",

  payment: "Payment Method",

  organisation: "Organisation Details",

  "organisation-address": "Business Address",

  "organisation-contact": "Business Contact",

  "community-policies": "Community Policies",

};

/* =========================================
PROFILE MODES
========================================= */

export const PROFILE_MODES = {

  PERSONAL: "PERSONAL",

  ORG: "ORG",

};

/* =========================================
PROFILE SECTIONS
========================================= */

export const PROFILE_SECTIONS = {

  USER: "user",

  HOME: "home",

  CONTACT: "contact",

  SOCIAL: "social",

  PAYMENT: "payment",

  ORGANISATION: "organisation",

  ORGANISATION_ADDRESS: "organisation-address",

  ORGANISATION_CONTACT: "organisation-contact",

  COMMUNITY_POLICIES: "community-policies",

};

/* =========================================
SOCIAL PROVIDERS
========================================= */

export const SOCIAL_PROVIDERS = {

  FACEBOOK: "facebook",

  INSTAGRAM: "instagram",

  YOUTUBE: "youtube",

  X: "x",

};