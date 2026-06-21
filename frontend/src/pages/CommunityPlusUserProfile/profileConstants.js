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
    id: "personal-profile",
    title: "Personal Profile",
    fields: [],
  },
];

export const ORG_STEPS = [
  {
    id: "organisation-profile",
    title: "Organisation Profile",
    fields: [],
  },
];

export const COMMUNITY_POLICY_STEPS = [
  {
    id: "community-policies",
    title: "Community Policies",
    fields: [],
  },
];