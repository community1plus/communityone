import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";

import { useGoogleMaps } from "../../context/GoogleMapsProvider";
import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import PageHeader from "../../components/UI/PageHeader";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";
import FormBuilder from "../../components/UI/Form/FormBuilder";
import useForm from "../../hooks/useForm";
import SplashHeader from "../../components/SplashHeader/SplashHeader";
import "../../styles/system.css";
import "./CommunityPlusUserProfile.css";
import BusinessRegistrationForm from "../../components/BusinessRegistration/BusinessRegistrationForm";





const DEFAULT_PHONE_COUNTRY = "AU";

const PHONE_COUNTRIES = [
  { code: "AU", label: "Australia", dialCode: "+61", min: 9, max: 9 },
  { code: "NZ", label: "New Zealand", dialCode: "+64", min: 8, max: 10 },
  { code: "US", label: "United States", dialCode: "+1", min: 10, max: 10 },
  { code: "GB", label: "United Kingdom", dialCode: "+44", min: 10, max: 10 },
  { code: "CA", label: "Canada", dialCode: "+1", min: 10, max: 10 },
  { code: "NG", label: "Nigeria", dialCode: "+234", min: 10, max: 10 },
  { code: "ZA", label: "South Africa", dialCode: "+27", min: 9, max: 9 },
  { code: "IN", label: "India", dialCode: "+91", min: 10, max: 10 },
];

const SOCIAL_PROVIDERS = [
  {
    id: "facebook",
    label: "Facebook",
    description: "Verify business page admin access.",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Verify professional or creator account access.",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Verify channel ownership.",
  },
  {
    id: "x",
    label: "X / Twitter",
    description: "Verify account ownership.",
  },
];

const PROFILE_TABS = [
  { id: "PERSONAL", label: "Personal" },
  { id: "ORG", label: "Organisation" },
  { id: "MIXED", label: "Mixed" },
  { id: "COMMUNITY_POLICIES", label: "Community Policies" },
];

const PERSONAL_STEPS = [
  {
    id: "user-profile",
    title: "USER PROFILE",
    fields: [
      {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
      },
      {
        name: "display_name",
        label: "Display Name",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "home-address",
    title: "HOME ADDRESS",
    fields: [
      {
        name: "homeLocation",
        label: "Home Address",
        type: "location",
        required: true,
      },
    ],
  },
  {
    id: "contact",
    title: "CONTACT",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        required: true,
      },
      {
        name: "phoneVerificationCode",
        label: "Verification Code",
        type: "text",
      },
    ],
  },
  {
    id: "social",
    title: "SOCIAL",
    fields: [],
  },
  {
    id: "payment",
    title: "PAYMENT DETAILS",
    customComponent: "stripe-payment",
  },
];

const ORG_STEPS = [
  {
    id: "organisation-profile",
    title: "ORGANISATION",
    fields: [
      {
        name: "organisation.name",
        label: "Organisation Name",
        type: "text",
        required: true,
      },
      {
        name: "organisation.registration",
        label: "Registration / ABN",
        type: "text",
      },
      {
        name: "organisation.website",
        label: "Website",
        type: "text",
      },
      {
        name: "organisation.description",
        label: "Description",
        type: "text",
      },
    ],
  },
  {
    id: "organisation-address",
    title: "ADDRESS",
    fields: [
      {
        name: "organisation.location",
        label: "Organisation Address",
        type: "location",
        required: true,
      },
    ],
  },
  {
    id: "organisation-contact",
    title: "CONTACT",
    fields: [
      {
        name: "organisation.phone",
        label: "Organisation Phone",
        type: "tel",
        required: true,
      },
      {
        name: "organisation.email",
        label: "Organisation Email",
        type: "email",
        required: true,
      },
      {
        name: "businessEmailVerificationCode",
        label: "Email Verification Code",
        type: "text",
      },
    ],
  },
  {
    id: "organisation-social",
    title: "SOCIAL",
    fields: [],
  },
  {
    id: "organisation-payment",
    title: "PAYMENT DETAILS",
    customComponent: "stripe-payment",
  },
];

const MIXED_STEPS = [
  {
    id: "mixed-profile",
    title: "MIXED PROFILE",
    fields: [
      {
        name: "creator.name",
        label: "Creator Name",
        type: "text",
      },
      {
        name: "business.name",
        label: "Business Name",
        type: "text",
      },
      {
        name: "business.website",
        label: "Website",
        type: "text",
      },
    ],
  },
  {
    id: "mixed-address",
    title: "ADDRESS",
    fields: [
      {
        name: "business.location",
        label: "Business Address",
        type: "location",
        required: true,
      },
    ],
  },
  {
    id: "mixed-contact",
    title: "CONTACT",
    fields: [
      {
        name: "business.phone",
        label: "Business Phone",
        type: "tel",
      },
      {
        name: "business.email",
        label: "Business Email",
        type: "email",
      },
      {
        name: "businessEmailVerificationCode",
        label: "Email Verification Code",
        type: "text",
      },
    ],
  },
  {
    id: "mixed-social",
    title: "SOCIAL",
    fields: [],
  },
  {
    id: "mixed-payment",
    title: "PAYMENT DETAILS",
    customComponent: "stripe-payment",
  },
];



const COMMUNITY_POLICY_STEPS = [
  {
    id: "community-policies",
    title: "COMMUNITY POLICIES",
    fields: [
      {
        name: "policies.communityStandards",
        label: "Accept Community Standards",
        type: "checkbox",
        required: true,
      },
      {
        name: "policies.creatorGuidelines",
        label: "Accept Creator Guidelines",
        type: "checkbox",
      },
      {
        name: "policies.marketplacePolicies",
        label: "Accept Marketplace Policies",
        type: "checkbox",
      },
      {
        name: "policies.participationFramework",
        label: "Accept Proof of Participation Framework",
        type: "checkbox",
      },
    ],
  },
];

function digitsOnly(value = "") {
  return String(value).replace(/\D/g, "");
}

function getPhoneCountry(code = DEFAULT_PHONE_COUNTRY) {
  return (
    PHONE_COUNTRIES.find((country) => country.code === code) ||
    PHONE_COUNTRIES[0]
  );
}

function stripDialCode(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  let digits = digitsOnly(phone);
  const dialDigits = digitsOnly(country.dialCode);

  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  if (country.code === "AU" && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

function toE164Phone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  const digits = stripDialCode(phone, countryCode);

  return digits ? `${country.dialCode}${digits}` : "";
}

function isValidInternationalPhone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  const nationalDigits = stripDialCode(phone, countryCode);

  return (
    nationalDigits.length >= country.min &&
    nationalDigits.length <= country.max
  );
}

function getBusinessEmailValue(values) {
  if (values.userType === "ORG") {
    return values.organisation?.email || "";
  }

  if (values.userType === "MIXED") {
    return values.business?.email || "";
  }

  return "";
}

function getSocialStatus(social = {}, providerId) {
  const provider = social?.[providerId];

  if (!provider?.verified) {
    return {
      verified: false,
      text: "Not verified",
    };
  }

  return {
    verified: true,
    text:
      provider.pageName ||
      provider.channelTitle ||
      provider.handle ||
      provider.accountName ||
      "Account verified",
  };
}

function getUserEmail(user) {
  return (
    user?.email ||
    user?.attributes?.email ||
    user?.signInDetails?.loginId ||
    ""
  );
}

function getUserDisplayName(user) {
  return (
    user?.displayName ||
    user?.name ||
    user?.attributes?.name ||
    user?.attributes?.given_name ||
    getUserEmail(user).split("@")[0] ||
    ""
  );
}

function getInitialProfileValues({ user, homeLocation }) {
  return {
    username: getUserEmail(user).split("@")[0] || "",
    display_name: getUserDisplayName(user) || "",
    userType: "PERSONAL",

    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phone: "",
    phoneE164: "",
    phoneVerificationCode: "",

    businessEmailVerificationCode: "",

    homeLocation: homeLocation || null,

    organisation: {
      name: "",
      registration: "",
      website: "",
      description: "",
      phone: "",
      email: "",
      emailVerified: false,
      domainVerified: false,
      location: null,
    },

    creator: {
      name: "",
    },

    business: {
      name: "",
      website: "",
      phone: "",
      email: "",
      emailVerified: false,
      domainVerified: false,
      location: null,
    },

    policies: {
      communityStandards: false,
      creatorGuidelines: false,
      marketplacePolicies: false,
      participationFramework: false,
    },

    payment: {
      cardName: "",
      last4: "",
    },
  };
}

export default function CommunityPlusUserProfile({ onComplete }) {
  const navigate = useNavigate();
  const [showBusinessRegistration, setShowBusinessRegistration] = useState(false);

  const pageLoadStartRef = useRef(performance.now());
  const autoRef = useRef(null);
  const socialCallbackHandledRef = useRef(false);
  const hydratedProfileRef = useRef(false);

  const { isLoaded } = useGoogleMaps();
  const { user, isAuthenticated } = useAuth();
  const { viewLocation: homeLocation, setManualLocation } =
    useLocationContext();

  const {
    profile,
    profileReady,
    profileMissing,
    profileError: contextProfileError,
    completionPercent,
    saveProfile,
    patchProfile,
  } = useProfile();

  const form = useForm({
    initialValues: getInitialProfileValues({
      user,
      homeLocation,
    }),
  });

    const {
    values,
    validateAll,
    setValue,
    setValues,
    isFormValidating,
    clearStorage,
  } = form;

  

  const [activeProfileTab, setActiveProfileTab] = useState("PERSONAL");
  const [currentStep, setCurrentStep] = useState(0);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [phoneStatus, setPhoneStatus] = useState("idle");
  const [phoneError, setPhoneError] = useState("");
  const [editingVerifiedPhone, setEditingVerifiedPhone] = useState(false);

  const [businessEmailStatus, setBusinessEmailStatus] = useState("idle");
  const [businessEmailError, setBusinessEmailError] = useState("");

  const activeSteps = useMemo(() => {
    switch (activeProfileTab) {
      case "ORG":
        return ORG_STEPS;

      case "MIXED":
        return MIXED_STEPS;

      case "COMMUNITY_POLICIES":
        return COMMUNITY_POLICY_STEPS;

      case "PERSONAL":
      default:
        return PERSONAL_STEPS;
    }
  }, [activeProfileTab]);

  const currentStepConfig = activeSteps[currentStep];
  const isContactStep = currentStepConfig?.id?.includes("contact");
  const isSocialStep = currentStepConfig?.id?.includes("social");

  useEffect(() => {
    setCurrentStep(0);
    setBusinessEmailStatus("idle");
    setBusinessEmailError("");
  }, [activeProfileTab]);

  const selectedPhoneCountry = useMemo(
    () => getPhoneCountry(values.phoneCountry),
    [values.phoneCountry]
  );

  const phoneE164 = useMemo(
    () => toE164Phone(values.phone, values.phoneCountry),
    [values.phone, values.phoneCountry]
  );

  const phoneIsValid = useMemo(
    () => isValidInternationalPhone(values.phone, values.phoneCountry),
    [values.phone, values.phoneCountry]
  );

  const canSaveFromContact =
    !isContactStep ||
    activeProfileTab !== "PERSONAL" ||
    profile?.phoneVerified ||
    phoneStatus === "verified";

  const displayCompletion = completionPercent || 0;

  useEffect(() => {
    if (!profileReady) return;
    if (!profile) return;
    if (hydratedProfileRef.current) return;

    const email = getUserEmail(user);
    const emailPrefix = email.split("@")[0] || "";
    const displayName = getUserDisplayName(user);

  const handleProfileTabChange = useCallback(
  (tabId) => {
    setActiveProfileTab(tabId);

    setValue("userType", tabId);

    setCurrentStep(0);

    if (
      tabId === "ORG" ||
      tabId === "MIXED"
    ) {
      setShowBusinessRegistration(true);
    }
  },
  [setValue]
);

    setValues((prev) => ({
      ...prev,

      username: profile?.username || emailPrefix || "",
      display_name: profile?.display_name || displayName || emailPrefix || "",
      userType: profile?.userType || "PERSONAL",

      phoneCountry: profile?.phoneCountry || DEFAULT_PHONE_COUNTRY,
      phone: profile?.phoneDisplay || "",
      phoneE164: profile?.phoneE164 || profile?.phone || "",
      phoneVerificationCode: "",

      businessEmailVerificationCode: "",

      homeLocation: profile?.homeLocation || homeLocation || null,

      organisation: {
        ...prev.organisation,
        ...(profile?.organisation || {}),
      },

      creator: {
        ...prev.creator,
        ...(profile?.creator || {}),
      },

      business: {
        ...prev.business,
        ...(profile?.business || {}),
      },

      policies: {
        ...prev.policies,
        ...(profile?.policies || {}),
      },

      payment: {
        cardName: profile?.payment?.cardName || "",
        last4: profile?.payment?.last4 || "",
      },
    }));

    if (profile?.userType) {
      setActiveProfileTab(profile.userType);
    }

    requestAnimationFrame(() => {
      hydratedProfileRef.current = true;
    });
  }, [profileReady, profile, user, homeLocation, setValues]);

  useEffect(() => {
    if (profile?.phoneVerified) {
      setPhoneStatus("verified");
      setEditingVerifiedPhone(false);
    } else {
      setPhoneStatus("idle");
    }
  }, [profile?.phoneVerified]);

  useEffect(() => {
    if (!values.phone) return;

    const originalPhone = profile?.phoneE164 || profile?.phone || "";

    if (originalPhone && phoneE164 && phoneE164 !== originalPhone) {
      setValue("phoneVerificationCode", "");
      setPhoneStatus("idle");
      setPhoneError("");
    }
  }, [values.phone, phoneE164, profile?.phoneE164, profile?.phone, setValue]);

  useEffect(() => {
    const syncSocialVerification = async () => {
      const params = new URLSearchParams(window.location.search);

      const socialProvider = params.get("social");
      const verified = params.get("verified");
      const reason = params.get("reason");

      if (!socialProvider || socialCallbackHandledRef.current) return;

      if (!isAuthenticated || (!user?.id && !getUserEmail(user))) {
        return;
      }

      if (!profileReady) return;

      socialCallbackHandledRef.current = true;
      setCurrentStep(3);

      if (verified === "false") {
        setProfileError(
          reason
            ? `Social verification failed: ${reason}`
            : "Social verification failed."
        );

        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (verified !== "true") return;

      const verifiedAt = new Date().toISOString();

      const socialPatch = {
        social: {},
      };

      if (socialProvider === "youtube") {
        socialPatch.social.youtube = {
          verified: true,
          verifiedAt,
          channelId: params.get("channelId") || "",
          channelTitle: params.get("channelTitle") || "YouTube channel",
        };
      } else if (socialProvider === "facebook") {
        socialPatch.social.facebook = {
          verified: true,
          verifiedAt,
          facebookId: params.get("facebookId") || "",
          accountName: params.get("name") || "Facebook Account",
          email: params.get("email") || "",
          profilePicture: params.get("profilePicture") || "",
          pageCount: Number(params.get("pageCount") || 0),
        };
      } else if (socialProvider === "instagram") {
        socialPatch.social.instagram = {
          verified: true,
          verifiedAt,
          instagramId: params.get("instagramId") || "",
          username: params.get("username") || "",
          followersCount: Number(params.get("followersCount") || 0),
          followsCount: Number(params.get("followsCount") || 0),
          mediaCount: Number(params.get("mediaCount") || 0),
        };
      } else if (socialProvider === "x") {
        socialPatch.social.x = {
          verified: true,
          verifiedAt,
          username: params.get("username") || "",
          name: params.get("name") || "",
          profileImage: params.get("profileImage") || "",
          followersCount: Number(params.get("followersCount") || 0),
        };
      } else {
        socialPatch.social[socialProvider] = {
          verified: true,
          verifiedAt,
        };
      }

      setProfileError("");

      try {
        await patchProfile(socialPatch);

        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Social verification save failed:", err);

        setProfileError(
          err?.message ||
            "Social verification succeeded, but saving it failed."
        );
      }
    };

    syncSocialVerification();
  }, [isAuthenticated, user?.id, profileReady, patchProfile]);

  useEffect(() => {
    const total = performance.now() - pageLoadStartRef.current;

    console.log(`[PROFILE PAGE] Total render ready: ${total.toFixed(2)}ms`);
  }, []);

const handleBusinessRegistrationComplete = useCallback(
  (business) => {
    if (values.userType === "ORG") {
      setValue("organisation", {
        ...values.organisation,
        ...business,
      });
    }

    if (values.userType === "MIXED") {
      setValue("business", {
        ...values.business,
        ...business,
      });
    }

    setShowBusinessRegistration(false);
  },
  [values, setValue]
);

  const handlePhoneCountryChange = useCallback(
    (event) => {
      const nextCountry = event.target.value;
      const nextE164 = toE164Phone(values.phone, nextCountry);

      setValue("phoneCountry", nextCountry);
      setValue("phoneE164", nextE164);
      setValue("phoneVerificationCode", "");

      setPhoneStatus("idle");
      setPhoneError("");
      setEditingVerifiedPhone(false);
    },
    [values.phone, setValue]
  );

  const startSocialVerification = useCallback((providerId) => {
    const apiBase = import.meta.env.VITE_API_BASE;

    if (!apiBase) {
      setProfileError("Backend API is not configured.");
      return;
    }

    const providerRoutes = {
      youtube: "/youtube/start",
      x: "/x/start",
      instagram: "/instagram/start",
      facebook: "/facebook/start",
    };

    const route = providerRoutes[providerId];

    if (!route) {
      setProfileError("Unsupported social provider.");
      return;
    }

    window.location.href = `${apiBase}${route}`;
  }, []);

  const sendPhoneCode = useCallback(async () => {
    const cleanPhone = toE164Phone(values.phone, values.phoneCountry);

    if (!cleanPhone) {
      setPhoneError("Enter your phone number first.");
      return;
    }

    if (!isValidInternationalPhone(values.phone, values.phoneCountry)) {
      setPhoneError(`Enter a valid phone number for ${selectedPhoneCountry.label}.`);
      return;
    }

    setPhoneStatus("sending");
    setPhoneError("");
    setValue("phoneVerificationCode", "");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SMS_API_URL}/auth/send-phone-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to send verification code");
      }

      setPhoneStatus("sent");
    } catch (err) {
      console.error("Send phone code failed:", err);
      setPhoneStatus("error");
      setPhoneError(err?.message || "Could not send verification code");
    }
  }, [values.phone, values.phoneCountry, selectedPhoneCountry.label, setValue]);

  const verifyPhoneCode = useCallback(async () => {
    if (phoneStatus !== "sent") {
      setPhoneError("Send a verification code first.");
      return;
    }

    if (!values.phoneVerificationCode) {
      setPhoneError("Enter the verification code.");
      return;
    }

    setPhoneStatus("verifying");
    setPhoneError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SMS_API_URL}/auth/verify-phone-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: toE164Phone(values.phone, values.phoneCountry),
            code: values.phoneVerificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.verified) {
        throw new Error(data?.message || "Invalid verification code");
      }

      setPhoneStatus("verified");
      setEditingVerifiedPhone(false);

      await patchProfile({
        phone: toE164Phone(values.phone, values.phoneCountry),
        phoneE164: toE164Phone(values.phone, values.phoneCountry),
        phoneDisplay: values.phone,
        phoneCountry: values.phoneCountry,
        phoneVerified: true,
      });
    } catch (err) {
      console.error("Verify phone code failed:", err);
      setPhoneStatus("error");
      setPhoneError(err?.message || "Verification failed");
    }
  }, [phoneStatus, values, patchProfile]);

  const sendBusinessEmailCode = useCallback(async () => {
    const email = getBusinessEmailValue(values).trim();

    if (!email) {
      setBusinessEmailError("Enter the business email first.");
      return;
    }

    setBusinessEmailStatus("sending");
    setBusinessEmailError("");
    setValue("businessEmailVerificationCode", "");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/business-email-verification/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userType: values.userType,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to send verification code");
      }

      setBusinessEmailStatus("sent");
    } catch (err) {
      setBusinessEmailStatus("error");
      setBusinessEmailError(
        err?.message || "Could not send verification code"
      );
    }
  }, [values, setValue]);

  const verifyBusinessEmailCode = useCallback(async () => {
    const email = getBusinessEmailValue(values).trim();
    const code = values.businessEmailVerificationCode;

    if (!email) {
      setBusinessEmailError("Enter the business email first.");
      return;
    }

    if (!code) {
      setBusinessEmailError("Enter the verification code.");
      return;
    }

    setBusinessEmailStatus("verifying");
    setBusinessEmailError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/business-email-verification/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userType: values.userType,
            email,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.verified) {
        throw new Error(data?.message || "Invalid verification code");
      }

      setBusinessEmailStatus("verified");

      if (values.userType === "ORG") {
        await patchProfile({
          organisation: {
            ...values.organisation,
            email,
            emailVerified: true,
            domainVerified: data.domainVerified ?? true,
          },
        });
      }

      if (values.userType === "MIXED") {
        await patchProfile({
          business: {
            ...values.business,
            email,
            emailVerified: true,
            domainVerified: data.domainVerified || false,
          },
        });
      }
    } catch (err) {
      setBusinessEmailStatus("error");
      setBusinessEmailError(
        err?.message || "Business email verification failed"
      );
    }
  }, [values, patchProfile]);

  const onPlaceChanged = useCallback(() => {
    const place = autoRef.current?.getPlace();

    if (!place?.geometry) return;

    const manualLocation = {
      label: place.formatted_address,
      fullAddress: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      type: "manual",
      accuracy: "MANUAL",
    };

    if (values.userType === "ORG") {
      setValue("organisation.location", manualLocation);
    } else if (values.userType === "MIXED") {
      setValue("business.location", manualLocation);
    } else {
      setManualLocation(manualLocation);
      setValue("homeLocation", manualLocation);
    }
  }, [values.userType, setManualLocation, setValue]);

  const buildProfilePayload = useCallback(
    () => ({
      username: values.username,
      display_name: values.display_name,
      userType: values.userType,

      phone: phoneE164,
      phoneE164,
      phoneDisplay: values.phone,
      phoneCountry: values.phoneCountry,

      homeLocation: values.homeLocation || homeLocation,

      organisation: values.organisation,
      creator: values.creator,
      business: values.business,
      policies: values.policies,

      payment: {
        cardName: values.payment?.cardName || "",
        last4: values.payment?.last4 || "",
      },
    }),
    [values, phoneE164, homeLocation]
  );

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    setProfileError("");

    try {
      const payload = buildProfilePayload();
      const nextProfile = await saveProfile(payload);

      clearStorage?.();
      onComplete?.(nextProfile);
    } catch (err) {
      console.error("Profile save failed:", err);

      setProfileError(err?.message || "Profile save failed");
    } finally {
      setSavingProfile(false);
    }
  }, [saveProfile, buildProfilePayload, clearStorage, onComplete]);

  const closeProfile = useCallback(() => {
    if (!profileReady) return;

    navigate("/communityplus", {
      replace: true,
    });
  }, [profileReady, navigate]);

  const handleComplete = useCallback(async () => {
    const valid = await validateAll();

    if (!valid) return;

    await handleSaveProfile();
  }, [validateAll, handleSaveProfile]);

if (!profileReady) {
  return (
    <div className="profile-page">
      <SplashHeader />
{showBusinessRegistration && (
  <div className="business-registration-overlay">
    <BusinessRegistrationForm
      accountType={values.userType}
      initialBusinessName={
        values.userType === "ORG"
          ? values.organisation?.name
          : values.business?.name
      }
      onCancel={() => setShowBusinessRegistration(false)}
      onComplete={handleBusinessRegistrationComplete}
    />
  </div>
)}
      <main className="profile-main">
        <div className="profile-loading-card">
          Loading your profile...
        </div>
      </main>
    </div>
  );
}

  if (contextProfileError && !profileMissing) {
    return (
      <div style={{ padding: 40 }}>
        <div className="error">{contextProfileError}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <SplashHeader />
{showBusinessRegistration && (
  <div className="business-registration-overlay">

    <BusinessRegistrationForm
      accountType={values.userType}
      initialBusinessName={
        values.userType === "ORG"
          ? values.organisation?.name
          : values.business?.name
      }

      onCancel={() =>
        setShowBusinessRegistration(false)
      }

      onComplete={
        handleBusinessRegistrationComplete
      }
    />

  </div>
)}
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-layout">
            <div className="profile-left">
              <div className="profile-page-header">
                <div className="profile-title-row">
                  <PageHeader title="USER PROFILE" />

                  <div className="profile-type-tabs">
                    {PROFILE_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`profile-type-tab ${
                          activeProfileTab === tab.id ? "active" : ""
                        }`}
                        onClick={() => handleProfileTabChange(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-completion">
                  <div className="profile-completion-header">
                    <span>Profile completion</span>
                    <strong>{displayCompletion}%</strong>
                  </div>

                  <div className="profile-completion-track">
                    <div
                      className="profile-completion-fill"
                      style={{
                        width: `${displayCompletion}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="profile-section-tabs">
                  {activeSteps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      className={`profile-section-tab ${
                        currentStep === index ? "active" : ""
                      } ${index < currentStep ? "complete" : ""}`}
                      onClick={() => setCurrentStep(index)}
                    >
                      {step.title}
                    </button>
                  ))}
                </div>
              </div>

              <Section>
                <div className="section-inner">
                  {isContactStep && activeProfileTab === "PERSONAL" && (
                    <>
                      <div className="phone-meta-inline">
                        Selected country: {selectedPhoneCountry.label}.
                        Verification number:{" "}
                        {phoneE164 || selectedPhoneCountry.dialCode}
                      </div>

                      <div className="phone-country-row">
                        <label
                          className="phone-country-label"
                          htmlFor="phoneCountry"
                        >
                          Country
                        </label>

                        <select
                          id="phoneCountry"
                          className="phone-country-select"
                          value={values.phoneCountry}
                          onChange={handlePhoneCountryChange}
                          disabled={
                            profile?.phoneVerified && !editingVerifiedPhone
                          }
                        >
                          {PHONE_COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.label} {country.dialCode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {isSocialStep ? (
                    <div className="social-verification-list">
                      {SOCIAL_PROVIDERS.map((provider) => {
                        const status = getSocialStatus(
                          profile?.social,
                          provider.id
                        );

                        return (
                          <div
                            className="social-verification-row"
                            key={provider.id}
                          >
                            <div className="social-verification-main">
                              <strong>{provider.label}</strong>
                              <span>{provider.description}</span>

                              <small
                                className={
                                  status.verified ? "success" : "hint"
                                }
                              >
                                {status.text}
                              </small>
                            </div>

                            <button
                              type="button"
                              className={`social-verify-button ${
                                status.verified ? "verified" : "unverified"
                              }`}
                              onClick={() =>
                                startSocialVerification(provider.id)
                              }
                            >
                              {status.verified ? "Verified" : "Verify"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <FormBuilder
                      steps={activeSteps}
                      currentStep={currentStep}
                      form={form}
                      extra={{
                        Autocomplete,
                        autoRef,
                        onPlaceChanged,
                        isLoaded,
                      }}
                    />
                  )}

                  {isContactStep && activeProfileTab === "PERSONAL" && (
                    <div className="phone-verification">
                      {profile?.phoneVerified && !editingVerifiedPhone ? (
                        <div className="phone-verified-state">
                          <div className="success">✓ Verified Number</div>

                          <div className="verified-phone-display">
                            {phoneE164}
                          </div>

                          <div className="hint">
                            This number has already been verified using MFA.
                          </div>

                          <div className="phone-verification-row">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditingVerifiedPhone(true);
                                setValue("phoneVerificationCode", "");
                                setPhoneStatus("idle");
                                setPhoneError("");
                              }}
                            >
                              Change Number
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {values.phone && !phoneIsValid && (
                            <div className="error">
                              Enter a valid phone number for{" "}
                              {selectedPhoneCountry.label}.
                            </div>
                          )}

                          {phoneStatus === "idle" && (
                            <div className="hint">
                              Enter your phone number and request a verification
                              code.
                            </div>
                          )}

                          {phoneStatus === "sent" && (
                            <div className="hint">
                              Enter the verification code sent to your phone.
                            </div>
                          )}

                          <div className="phone-verification-row">
                            <Button
                              variant="ghost"
                              onClick={sendPhoneCode}
                              disabled={
                                phoneStatus === "sending" || !phoneIsValid
                              }
                            >
                              {phoneStatus === "sending"
                                ? "Sending..."
                                : "Send verification code"}
                            </Button>

                            <Button
                              onClick={verifyPhoneCode}
                              disabled={phoneStatus !== "sent"}
                            >
                              {phoneStatus === "verifying"
                                ? "Verifying..."
                                : "Verify"}
                            </Button>
                          </div>

                          {phoneStatus === "sent" && (
                            <div className="success">
                              Verification code sent. Enter the code above.
                            </div>
                          )}

                          {phoneStatus === "verified" && (
                            <div className="success">
                              Phone number verified successfully.
                            </div>
                          )}

                          {phoneError && (
                            <div className="error">{phoneError}</div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {["ORG", "MIXED"].includes(values.userType) &&
                    isContactStep && (
                      <div className="business-email-verification">
                        <div className="hint">
                          Verify your business email to prove authority over
                          this profile.
                        </div>

                        <div className="phone-verification-row">
                          <Button
                            variant="ghost"
                            onClick={sendBusinessEmailCode}
                            disabled={businessEmailStatus === "sending"}
                          >
                            {businessEmailStatus === "sending"
                              ? "Sending..."
                              : "Send email code"}
                          </Button>

                          <Button
                            onClick={verifyBusinessEmailCode}
                            disabled={businessEmailStatus !== "sent"}
                          >
                            {businessEmailStatus === "verifying"
                              ? "Verifying..."
                              : "Verify email"}
                          </Button>
                        </div>

                        {businessEmailStatus === "sent" && (
                          <div className="success">
                            Verification code sent to the business email.
                          </div>
                        )}

                        {businessEmailStatus === "verified" && (
                          <div className="success">
                            Business email verified.
                          </div>
                        )}

                        {businessEmailError && (
                          <div className="error">{businessEmailError}</div>
                        )}
                      </div>
                    )}
                </div>
              </Section>

              {profileMissing && (
                <div className="hint">
                  No saved profile found yet. Complete the form and save to
                  create your profile.
                </div>
              )}

              {profileError && <div className="error">{profileError}</div>}

              <div className="form-navigation">
                <Button variant="ghost" onClick={closeProfile}>
                  Close
                </Button>

                <div className="form-actions">
                  <Button
                    onClick={handleComplete}
                    disabled={
                      isFormValidating ||
                      savingProfile ||
                      !canSaveFromContact
                    }
                  >
                    {savingProfile ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="profile-guide">
              <Section
                title="Profile Guide"
                meta="Verify your social accounts to prove ownership of pages, channels, or official accounts."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}