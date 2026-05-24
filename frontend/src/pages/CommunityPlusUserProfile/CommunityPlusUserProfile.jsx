import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

import "../../styles/system.css";
import "./CommunityPlusUserProfile.css";

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
  { id: "facebook", label: "Facebook", description: "Verify business page admin access." },
  { id: "instagram", label: "Instagram", description: "Verify professional or creator account access." },
  { id: "youtube", label: "YouTube", description: "Verify channel ownership." },
  { id: "x", label: "X / Twitter", description: "Verify account ownership." },
];

const PROFILE_TABS = [
  {
    id: "PERSONAL",
    label: "Personal",
  },

  {
    id: "ORG",
    label: "Organisation",
  },

  {
    id: "MIXED",
    label: "Mixed",
  },

  {
    id: "COMMUNITY_POLICIES",
    label: "Community Policies",
  },
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
  return PHONE_COUNTRIES.find((country) => country.code === code) || PHONE_COUNTRIES[0];
}

function stripDialCode(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  let digits = digitsOnly(phone);
  const dialDigits = digitsOnly(country.dialCode);

  if (digits.startsWith(dialDigits)) digits = digits.slice(dialDigits.length);
  if (country.code === "AU" && digits.startsWith("0")) digits = digits.slice(1);

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

  return nationalDigits.length >= country.min && nationalDigits.length <= country.max;
}

function normaliseSocialState(
  social = {}
) {

  const result = {};

  if (
    social?.facebook &&
    typeof social.facebook === "object"
  ) {
    result.facebook =
      social.facebook;
  }

  if (
    social?.instagram &&
    typeof social.instagram === "object"
  ) {
    result.instagram =
      social.instagram;
  }

  if (
    social?.youtube &&
    typeof social.youtube === "object"
  ) {
    result.youtube =
      social.youtube;
  }

  if (
    social?.x &&
    typeof social.x === "object"
  ) {
    result.x =
      social.x;
  }

  return result;
}

function getSocialStatus(
  social = {},
  providerId
) {

  const provider =
    social?.[providerId];

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
  return user?.email || user?.attributes?.email || user?.signInDetails?.loginId || "";
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

    homeLocation: homeLocation || null,


    payment: {
      cardName: "",
      last4: "",
    },
  };
}

export default function CommunityPlusUserProfile({ onComplete }) {
  const navigate = useNavigate();

  const autoRef = useRef(null);
  const lastHomeLocationRef = useRef("");
  const socialCallbackHandledRef = useRef(false);
  const hydratedProfileRef = useRef(false);

  const { isLoaded } = useGoogleMaps();
  const { user, isAuthenticated } = useAuth();
  const { viewLocation: homeLocation, setManualLocation } = useLocationContext();

  const {
    profile,
    profileReady,
    profileMissing,
    profileError: contextProfileError,
    completionPercent,
    saveProfile,
    patchProfile
  } = useProfile();

  const form = useForm({
    initialValues: getInitialProfileValues({ user, homeLocation }),
  });

  const {
  values,
  validateAll,

  setValue,
  setValues,

  isFormValidating,
  clearStorage,
} = form;

  const [activeProfileTab, setActiveProfileTab] =  useState("PERSONAL");

  const [currentStep, setCurrentStep] =  useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("idle");

  const [phoneError, setPhoneError] = useState("");

  const [editingVerifiedPhone, setEditingVerifiedPhone] = useState(false);

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

const currentStepConfig =  activeSteps[currentStep];
const isLastStep =  currentStep === activeSteps.length - 1;
const isContactStep =  currentStepConfig?.id === "contact";
const isSocialStep =  currentStepConfig?.id === "social";

useEffect(() => {

  setCurrentStep(0);

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

  const canContinueFromContact = !isContactStep || profile?.phoneVerified;

  console.log("PROFILE PAGE STATE:", {
  profileReady,
  profile,
  values,
  currentStep,
});

  const displayCompletion = completionPercent || 0;

  useEffect(() => {

    console.log("HYDRATION EFFECT RUNNING", {
  profileReady,
  profile,
  hydratedProfileRef: hydratedProfileRef.current,});

  if (!profileReady) return;

  if (!profile) return;

  if (hydratedProfileRef.current) return;

  const email = getUserEmail(user);

  const emailPrefix = email.split("@")[0] || "";

  const displayName = getUserDisplayName(user);

  setValues((prev) => ({

  ...prev,

  username:
    profile?.username ||
    emailPrefix ||
    "",

  display_name:
    profile?.display_name ||
    displayName ||
    emailPrefix ||
    "",

  userType:
    profile?.userType ||
    "PERSONAL",

  phoneCountry:
    profile?.phoneCountry ||
    DEFAULT_PHONE_COUNTRY,

  phone:
    profile?.phoneDisplay || "",

  phoneE164:
    profile?.phoneE164 ||
    profile?.phone ||
    "",

  phoneVerificationCode:
    "",

  homeLocation:
    profile?.homeLocation ||
    homeLocation ||
    null,

  payment: {

    cardName:
      profile?.payment?.cardName || "",

    last4:
      profile?.payment?.last4 || "",
  },
}));

  requestAnimationFrame(() => {
    hydratedProfileRef.current = true;
  });

}, [
  profileReady,
  profile,
  user,
  homeLocation,
  setValues,
]);

  useEffect(() => {
    console.log("HYDRATION EFFECT RUNNING FOR PHONE", {
  profileReady,
  profile,
});

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

      const socialProvider =
  params.get("social");

const verified =
  params.get("verified");

const reason =
  params.get("reason");

/* =========================
   YOUTUBE
========================= */

const channelId =
  params.get("channelId");

const channelTitle =
  params.get("channelTitle");

/* =========================
   FACEBOOK
========================= */

const facebookId =
  params.get("facebookId");

const name =
  params.get("name");

const email =
  params.get("email");

const profilePicture =
  params.get("profilePicture");

const pageCount =
  params.get("pageCount");

      if (!socialProvider || socialCallbackHandledRef.current) return;

      if (!isAuthenticated || (!user?.id && !getUserEmail(user))) {
        console.log("Waiting for authenticated session before saving social verification...");
        return;
      }

      if (!profileReady) return;

      socialCallbackHandledRef.current = true;
      setCurrentStep(3);

      if (verified === "false") {
        setProfileError(
          reason ? `Social verification failed: ${reason}` : "Social verification failed."
        );

        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (verified !== "true") return;

      const verifiedAt = new Date().toISOString();

     
const socialPatch = {
  social: {},
};

/* =========================
   YOUTUBE
========================= */

if (socialProvider === "youtube") {

  socialPatch.social.youtube = {

    verified: true,

    verifiedAt,

    channelId:
      channelId || "",

    channelTitle:
      channelTitle ||
      "YouTube channel",
  };
}

/* =========================
   FACEBOOK
========================= */

else if (
  socialProvider === "facebook"
) {

  socialPatch.social.facebook = {

    verified: true,

    verifiedAt,

    facebookId:
      facebookId || "",

    accountName:
      name ||
      "Facebook Account",

    email:
      email || "",

    profilePicture:
      profilePicture || "",

    pageCount:
      Number(pageCount || 0),
  };
}

/* =========================
   INSTAGRAM
========================= */

else if (
  socialProvider === "instagram"
) {

  const instagramId =
    params.get("instagramId");

  const instagramUsername =
    params.get("username");

  const followersCount =
    Number(
      params.get("followersCount") || 0
    );

  const followsCount =
    Number(
      params.get("followsCount") || 0
    );

  const mediaCount =
    Number(
      params.get("mediaCount") || 0
    );

  socialPatch.social.instagram = {

    verified: true,

    verifiedAt,

    instagramId:
      instagramId || "",

    username:
      instagramUsername || "",

    followersCount,

    followsCount,

    mediaCount,
  };
}

/* =========================
   X / TWITTER
========================= */

else if (
  socialProvider === "x"
) {

  const xUsername =
    params.get("username");

  const xName =
    params.get("name");

  const xProfileImage =
    params.get("profileImage");

  const xFollowersCount =
    Number(
      params.get("followersCount") || 0
    );

  socialPatch.social.x = {

    verified: true,

    verifiedAt,

    username:
      xUsername || "",

    name:
      xName || "",

    profileImage:
      xProfileImage || "",

    followersCount:
      xFollowersCount,
  };
}

/* =========================
   FALLBACK
========================= */

else {

  socialPatch.social[
    socialProvider
  ] = {

    verified: true,

    verifiedAt,
  };
}

     
      setProfileError("");

      try {
        const saved =
  await patchProfile(
    socialPatch
  );

console.log(
  "SOCIAL SAVED:",
  saved
);


        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Social verification save failed:", err);
        setProfileError(
          err?.message || "Social verification succeeded, but saving it failed."
        );
      }
    };

    syncSocialVerification();
  }, [
  isAuthenticated,
  user?.id,
  profileReady,
  patchProfile,
]);

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

  const startSocialVerification = useCallback(
  (providerId) => {

    const apiBase =
      import.meta.env.VITE_API_BASE;

    if (!apiBase) {

      setProfileError(
        "Backend API is not configured."
      );

      return;
    }

    const providerRoutes = {

      youtube:
        "/youtube/start",

      x:
        "/x/start",

      instagram:
        "/instagram/start",

      facebook:
        "/facebook/start",
    };

    const route =
      providerRoutes[providerId];

    if (!route) {

      setProfileError(
        "Unsupported social provider."
      );

      return;
    }

    window.location.href =
      `${apiBase}${route}`;

  },
  []
);

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to send verification code");
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: toE164Phone(values.phone, values.phoneCountry),
            code: values.phoneVerificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.verified) {
        throw new Error("Invalid verification code");
      }

     

      setPhoneStatus("verified");

      setEditingVerifiedPhone(false);

      const verifiedPayload = {

  phone:
    toE164Phone(
      values.phone,
      values.phoneCountry
    ),

  phoneE164:
    toE164Phone(
      values.phone,
      values.phoneCountry
    ),

  phoneDisplay:
    values.phone,

  phoneCountry:
    values.phoneCountry,

  phoneVerified:
    true,
};


await patchProfile(verifiedPayload);
    } catch (err) {
      console.error("Verify phone code failed:", err);
      
      setPhoneStatus("error");
      setPhoneError(err?.message || "Verification failed");
    }
  }, [
  phoneStatus,
  values,
  setValue,
  saveProfile,
  homeLocation,
]);

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

    setManualLocation(manualLocation);
    setValue("homeLocation", manualLocation);
  }, [setManualLocation, setValue]);

  const buildProfilePayload = useCallback(
  () => ({

    username:
      values.username,

    display_name:
      values.display_name,

    userType:
      values.userType,

    phone:
      phoneE164,

    phoneE164,

    phoneDisplay:
      values.phone,

    phoneCountry:
      values.phoneCountry,

  

    homeLocation:
      values.homeLocation ||
      homeLocation,

    payment: {

      cardName:
        values.payment?.cardName || "",

      last4:
        values.payment?.last4 || "",
    },
  }),

  [
    values,
    phoneE164,
    homeLocation,
    profile,
  ]
);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    setProfileError("");

    try {
      const payload = buildProfilePayload();
      const nextProfile = await saveProfile(payload);

      clearStorage?.();
      onComplete?.(nextProfile);

      navigate("/communityplus", { replace: true });
    } catch (err) {
      console.error("Profile save failed:", err);
      setProfileError(err?.message || "Profile save failed");
    } finally {
      setSavingProfile(false);
    }
  }, [saveProfile, buildProfilePayload, clearStorage, onComplete, navigate]);

  const handleComplete = useCallback(async () => {
    const valid = await validateAll();
    if (!valid) return;

    await handleSaveProfile();
  }, [validateAll, handleSaveProfile]);

  const nextStep = useCallback(() => {

  if (
    isContactStep &&
    !profile?.phoneVerified
  ) {

    setPhoneError(
      "Verify your phone number before continuing."
    );

    return;
  }

  setCurrentStep((step) =>
    Math.min(
      activeSteps.length - 1,
      step + 1
    )
  );

}, [
  isContactStep,
  profile?.phoneVerified,
  activeSteps.length,
]);

  const prevStep = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const closeProfile = useCallback(() => {
    if (!profileReady) return;
    navigate("/communityplus", { replace: true });
  }, [profileReady, navigate]);

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  if (contextProfileError && !profileMissing) {
    return (
      <div style={{ padding: 40 }}>
        <div className="error">{contextProfileError}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-page-header">

  <PageHeader title="USER PROFILE" />

  <div className="profile-type-tabs">

    {PROFILE_TABS.map((tab) => (

      <button
        key={tab.id}
        type="button"
        className={`profile-type-tab ${
          activeProfileTab === tab.id
            ? "active"
            : ""
        }`}
        onClick={() =>
          setActiveProfileTab(tab.id)
        }
      >
        {tab.label}
      </button>

    ))}

  </div>

  <div className="profile-completion">

    <div className="profile-completion-header">

      <span>
        Profile completion
      </span>

      <strong>
        {displayCompletion}%
      </strong>

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
          currentStep === index
            ? "active"
            : ""
        } ${
          index < currentStep
            ? "complete"
            : ""
        }`}
        onClick={() =>
          setCurrentStep(index)
        }
      >
        {step.title}
      </button>

    ))}

  </div>

</div>

          <Section>
  <div className="section-inner">

    {isContactStep && (
      <div className="phone-meta-inline">
        Selected country: {selectedPhoneCountry.label}. Verification number:{" "}
        {phoneE164 || selectedPhoneCountry.dialCode}
      </div>
    )}

    {isContactStep && (
      <div className="phone-country-row">
        <label className="phone-country-label" htmlFor="phoneCountry">
          Country
        </label>

        <select
          id="phoneCountry"
          className="phone-country-select"
          value={values.phoneCountry}
          onChange={handlePhoneCountryChange}
          disabled={
            profile?.phoneVerified &&
            !editingVerifiedPhone
          }
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label} {country.dialCode}
            </option>
          ))}
        </select>
      </div>
    )}

    {isSocialStep ? (
      <div className="social-verification-list">
        {SOCIAL_PROVIDERS.map((provider) => {
          const status = getSocialStatus(profile?.social, provider.id);

          return (
            <div className="social-verification-row" key={provider.id}>
              <div className="social-verification-main">
                <strong>{provider.label}</strong>
                <span>{provider.description}</span>

                <small className={status.verified ? "success" : "hint"}>
                  {status.text}
                </small>
              </div>

              <button
                type="button"
                className={`social-verify-button ${
                  status.verified ? "verified" : "unverified"
                }`}
                onClick={() => startSocialVerification(provider.id)}
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

    {/* =========================================
       CONTACT VERIFICATION
    ========================================= */}

    {isContactStep && (

      <div className="phone-verification">

        {profile?.phoneVerified && !editingVerifiedPhone ? (

          <div className="phone-verified-state">

            <div className="success">
              ✓ Verified Number
            </div>

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
                Enter a valid phone number for {selectedPhoneCountry.label}.
              </div>
            )}

            {phoneStatus === "idle" && (
              <div className="hint">
                Enter your phone number and request a verification code.
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
                  phoneStatus === "sending" ||
                  !phoneIsValid
                }
              >
                {phoneStatus === "sending"
                  ? "Sending..."
                  : "Send verification code"}
              </Button>

              <Button
                onClick={verifyPhoneCode}
                disabled={
                  phoneStatus !== "sent"
                }
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
              <div className="error">
                {phoneError}
              </div>
            )}

          </>

        )}
      </div>
    )}

  </div>
</Section>

          

          {profileMissing && (
            <div className="hint">
              No saved profile found yet. Complete the form and save to create your profile.
            </div>
          )}

          {profileError && <div className="error">{profileError}</div>}

          <div className="form-navigation">
            <Button variant="ghost" onClick={closeProfile}>
              Close
            </Button>

            <div className="form-actions">
              {currentStep > 0 && (
                <Button variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              )}

              <Button
                onClick={isLastStep ? handleComplete : nextStep}
                disabled={
                  isFormValidating ||
                  savingProfile ||
                  (isContactStep && !canContinueFromContact)
                }
              >
                {savingProfile ? "Saving..." : isLastStep ? "Finish" : "Next"}
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
  );
}