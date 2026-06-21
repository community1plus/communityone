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

export const PERSONAL_STEPS = [
  {
    id: "personal",
    title: "Personal",
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

      {
        name: "phoneDisplay",
        label: "Phone Number",
        type: "text",
      },
    ],
  },
];

export const ORG_STEPS = [
  {
    id: "organisation",
    title: "Organisation",
    fields: [
      {
        name: "organisationName",
        label: "Organisation Name",
        type: "text",
      },

      {
        name: "organisationEmail",
        label: "Organisation Email",
        type: "email",
      },

      {
        name: "organisationPhone",
        label: "Organisation Phone",
        type: "text",
      },
    ],
  },
];

export const COMMUNITY_POLICY_STEPS = [
  {
    id: "community",
    title: "Community Policies",
    fields: [
      {
        name: "communityAgreement",
        label: "Agreement",
        type: "checkbox",
      },
    ],
  },
];