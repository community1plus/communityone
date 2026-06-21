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

/* =========================
   PERSONAL
========================= */

export const PERSONAL_STEPS = [
  {
    id: "user-profile",
    title: "USER PROFILE",
    fields: [
      {
        name: "display_name",
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
    id: "home-address",
    title: "HOME ADDRESS",
    fields: [
      {
        name: "streetAddress",
        label: "Street Address",
        type: "text",
      },
      {
        name: "suburb",
        label: "Suburb",
        type: "text",
      },
      {
        name: "postcode",
        label: "Postcode",
        type: "text",
      },
    ],
  },

  {
    id: "contact",
    title: "CONTACT",
    fields: [
      {
        name: "phoneDisplay",
        label: "Phone Number",
        type: "text",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
      },
    ],
  },

  {
    id: "social",
    title: "SOCIAL",
    fields: [
      {
        name: "facebookUrl",
        label: "Facebook",
        type: "text",
      },
      {
        name: "instagramUrl",
        label: "Instagram",
        type: "text",
      },
      {
        name: "youtubeUrl",
        label: "YouTube",
        type: "text",
      },
      {
        name: "xUrl",
        label: "X",
        type: "text",
      },
    ],
  },

  {
    id: "payment",
    title: "PAYMENT DETAILS",
    fields: [],
  },
];

/* =========================
   ORGANISATION
========================= */

export const ORG_STEPS = [
  {
    id: "organisation",
    title: "ORGANISATION",
    fields: [
      {
        name: "organisationName",
        label: "Organisation Name",
        type: "text",
      },
    ],
  },

  {
    id: "address",
    title: "ADDRESS",
    fields: [
      {
        name: "organisationStreetAddress",
        label: "Street Address",
        type: "text",
      },
      {
        name: "organisationSuburb",
        label: "Suburb",
        type: "text",
      },
      {
        name: "organisationPostcode",
        label: "Postcode",
        type: "text",
      },
    ],
  },

  {
    id: "contact",
    title: "CONTACT",
    fields: [
      {
        name: "organisationPhone",
        label: "Organisation Phone",
        type: "text",
      },
      {
        name: "organisationEmail",
        label: "Organisation Email",
        type: "email",
      },
    ],
  },

  {
    id: "social",
    title: "SOCIAL",
    fields: [
      {
        name: "organisationWebsite",
        label: "Website",
        type: "text",
      },
      {
        name: "facebookUrl",
        label: "Facebook",
        type: "text",
      },
      {
        name: "instagramUrl",
        label: "Instagram",
        type: "text",
      },
      {
        name: "youtubeUrl",
        label: "YouTube",
        type: "text",
      },
      {
        name: "xUrl",
        label: "X",
        type: "text",
      },
    ],
  },

  {
    id: "payment",
    title: "PAYMENT DETAILS",
    fields: [],
  },
];

/* =========================
   COMMUNITY POLICIES
========================= */

export const COMMUNITY_POLICY_STEPS = [
  {
    id: "community-policies",
    title: "COMMUNITY POLICIES",
    fields: [
      {
        name: "communityAgreement",
        label: "I agree to Community One policies",
        type: "checkbox",
      },
    ],
  },
];