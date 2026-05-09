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

const DEFAULT_PHONE_COUNTRY = "AU";

const profileSteps = [
  {
    id: "user",
    title: "USER",
    fields: [
      { name: "username", label: "Username", type: "text", required: true },
      { name: "display_name", label: "Display Name", type: "text", required: true },
      {
        name: "userType",
        label: "User Type",
        type: "select",
        required: true,
        options: [
          { value: "PERSONAL", label: "Personal" },
          { value: "BUSINESS", label: "Business" },
          { value: "GOVT", label: "Government" },
          { value: "COMMUNITY_SERVICES", label: "Community Services" },
        ],
      },
    ],
  },
  {
    id: "home-address",
    title: "HOME ADDRESS",
    fields: [{ name: "homeLocation", label: "Home Address", type: "location", required: true }],
  },
  {
    id: "contact",
    title: "CONTACT",
    fields: [
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "phoneVerificationCode", label: "Verification Code", type: "text" },
    ],
  },
  { id: "social", title: "SOCIAL", fields: [] },
  {
    id: "payment",
    title: "PAYMENT DETAILS",
    fields: [
      { name: "payment.cardName", label: "Name on Card", type: "text" },
      { name: "payment.last4", label: "Card Last 4 Digits", type: "text" },
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
  if (!digits) return "";
  return `${country.dialCode}${digits}`;
}

function isValidInternationalPhone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  const nationalDigits = stripDialCode(phone, countryCode);
  return nationalDigits.length >= country.min && nationalDigits.length <= country.max;
}

function getSocialStatus(social = {}, providerId) {
  const provider = social?.[providerId];

  if (!provider || !provider.verified) {
    return { verified: false, text: "Not verified" };
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

export default function CommunityPlusUserProfile({ onComplete }) {
  const navigate = useNavigate();

  const autoRef = useRef(null);
  const lastHomeLocationRef = useRef("");
  const socialCallbackHandledRef = useRef(false);

  const { isLoaded } = useGoogleMaps();
  const { user } = useAuth();
  const { viewLocation: homeLocation, setManualLocation } = useLocationContext();

  const {
    profile,
    profileReady,
    completionPercent,
    hasProfile,
    saveProfile,
  } = useProfile();

  const form = useForm({
    initialValues: {
      username: profile?.username || "",
      display_name: profile?.display_name || user?.displayName || "",
      userType: profile?.userType || "PERSONAL",

      phoneCountry: profile?.phoneCountry || DEFAULT_PHONE_COUNTRY,
      phone: profile?.phoneDisplay || profile?.phone || "",
      phoneE164: profile?.phoneE164 || profile?.phone || "",
      phoneVerified: profile?.phoneVerified || false,
      phoneVerificationCode: "",

      homeLocation: profile?.homeLocation || homeLocation || null,

      social: {
        facebook: profile?.social?.facebook || { verified: false },
        instagram: profile?.social?.instagram || { verified: false },
        youtube: profile?.social?.youtube || { verified: false },
        x: profile?.social?.x || { verified: false },
      },

      payment: {
        cardName: profile?.payment?.cardName || "",
        last4: profile?.payment?.last4 || "",
      },
    },
  });

  const { values, validateAll, setValue, isFormValidating, clearStorage } = form;

  const [currentStep, setCurrentStep] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("idle");
  const [phoneError, setPhoneError] = useState("");

  const currentStepConfig = profileSteps[currentStep];
  const isLastStep = currentStep === profileSteps.length - 1;
  const isContactStep = currentStepConfig?.id === "contact";
  const isSocialStep = currentStepConfig?.id === "social";

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

  const canContinueFromContact = !isContactStep || values.phoneVerified;
  const displayCompletion = completionPercent || 0;

  useEffect(() => {
    if (!user?.email) return;

    const prefix = user.email.split("@")[0];

    if (!values.username) {
      setValue("username", profile?.username || prefix);
    }

    if (!values.display_name) {
      setValue("display_name", profile?.display_name || user.displayName || prefix);
    }
  }, [
    user?.email,
    user?.displayName,
    profile?.username,
    profile?.display_name,
    values.username,
    values.display_name,
    setValue,
  ]);

  useEffect(() => {
    if (!homeLocation) return;

    const fingerprint = JSON.stringify({
      lat: homeLocation.lat,
      lng: homeLocation.lng,
      label: homeLocation.label || homeLocation.fullAddress || "",
    });

    if (lastHomeLocationRef.current === fingerprint) return;

    lastHomeLocationRef.current = fingerprint;
    setValue("homeLocation", homeLocation);
  }, [homeLocation, setValue]);

  useEffect(() => {
    if (phoneE164 !== values.phoneE164) {
      setValue("phoneE164", phoneE164);
    }
  }, [phoneE164, values.phoneE164, setValue]);

  useEffect(() => {
    if (!values.phone) return;

    const originalPhone = profile?.phoneE164 || profile?.phone || "";

    if (originalPhone && phoneE164 && phoneE164 !== originalPhone) {
      setValue("phoneVerified", false);
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

      const verifiedSocial = {
        ...values.social,
        [socialProvider]: {
          ...(values.social?.[socialProvider] || {}),
          verified: true,
          verifiedAt,
        },
      };

      const nextPayload = {
        username: values.username,
        display_name: values.display_name,
        userType: values.userType,

        phone: phoneE164,
        phoneE164,
        phoneDisplay: values.phone,
        phoneCountry: values.phoneCountry,
        phoneVerified: values.phoneVerified,

        homeLocation: values.homeLocation || homeLocation,

        social: verifiedSocial,

        payment: {
          cardName: values.payment?.cardName || "",
          last4: values.payment?.last4 || "",
        },
      };

      setValue("social", verifiedSocial);
      setProfileError("");

      console.log("Saving social verification payload:", nextPayload);

      try {
        await saveProfile(nextPayload);
        console.log("Social verification saved.");

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
    user?.id,
    user?.email,
    saveProfile,
    setValue,
    values,
    phoneE164,
    homeLocation,
  ]);

  const handlePhoneCountryChange = useCallback(
    (event) => {
      const nextCountry = event.target.value;
      const nextE164 = toE164Phone(values.phone, nextCountry);

      setValue("phoneCountry", nextCountry);
      setValue("phoneE164", nextE164);
      setValue("phoneVerified", false);
      setValue("phoneVerificationCode", "");

      setPhoneStatus("idle");
      setPhoneError("");
    },
    [values.phone, setValue]
  );

  const startSocialVerification = useCallback(
    (providerId) => {
      const baseUrl = import.meta.env.VITE_SOCIAL_API_URL;

      if (!baseUrl) {
        setProfileError("Social verification API is not configured.");
        return;
      }

      const params = new URLSearchParams({
        provider: providerId,
        userId: user?.id || user?.email || "",
      });

      window.location.href = `${baseUrl}/social/${providerId}/start?${params.toString()}`;
    },
    [user?.id, user?.email]
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
  }, [
    values.phone,
    values.phoneCountry,
    selectedPhoneCountry.label,
    setValue,
  ]);

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

      setValue("phoneVerified", true);
      setPhoneStatus("verified");
    } catch (err) {
      console.error("Verify phone code failed:", err);
      setValue("phoneVerified", false);
      setPhoneStatus("error");
      setPhoneError(err?.message || "Verification failed");
    }
  }, [
    phoneStatus,
    values.phone,
    values.phoneCountry,
    values.phoneVerificationCode,
    setValue,
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
      username: values.username,
      display_name: values.display_name,
      userType: values.userType,

      phone: phoneE164,
      phoneE164,
      phoneDisplay: values.phone,
      phoneCountry: values.phoneCountry,
      phoneVerified: values.phoneVerified,

      homeLocation: values.homeLocation || homeLocation,

      social: values.social,

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
    if (isContactStep && !values.phoneVerified) {
      setPhoneError("Verify your phone number before continuing.");
      return;
    }

    setCurrentStep((step) => Math.min(profileSteps.length - 1, step + 1));
  }, [isContactStep, values.phoneVerified]);

  const prevStep = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const closeProfile = useCallback(() => {
    if (!profileReady) return;

    if (!hasProfile) {
      navigate("/communityplus/profile", { replace: true });
      return;
    }

    navigate("/communityplus", { replace: true });
  }, [profileReady, hasProfile, navigate]);

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-page-header">
            <PageHeader title="USER PROFILE" />

            <div className="profile-completion">
              <div className="profile-completion-header">
                <span>Profile completion</span>
                <strong>{displayCompletion}%</strong>
              </div>

              <div className="profile-completion-track">
                <div
                  className="profile-completion-fill"
                  style={{ width: `${displayCompletion}%` }}
                />
              </div>
            </div>

            <div className="profile-section-tabs">
              {profileSteps.map((step, index) => (
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
                    const status = getSocialStatus(values.social, provider.id);

                    return (
                      <div
                        className="social-verification-row"
                        key={provider.id}
                      >
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
                  steps={profileSteps}
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
            </div>
          </Section>

          {isContactStep && (
            <div className="phone-verification">
              <div className="hint">
                Selected country: {selectedPhoneCountry.label}. Verification
                number: {phoneE164 || selectedPhoneCountry.dialCode}
              </div>

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

              {phoneStatus === "sent" && !values.phoneVerified && (
                <div className="hint">Enter the code sent to your phone.</div>
              )}

              <div className="phone-verification-row">
                <Button
                  variant="ghost"
                  onClick={sendPhoneCode}
                  disabled={phoneStatus === "sending" || values.phoneVerified}
                >
                  {phoneStatus === "sending"
                    ? "Sending..."
                    : "Send verification code"}
                </Button>

                <Button
                  onClick={verifyPhoneCode}
                  disabled={phoneStatus !== "sent" || values.phoneVerified}
                >
                  {phoneStatus === "verifying" ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {phoneStatus === "sent" && (
                <div className="success">
                  Verification code sent. Enter the code above.
                </div>
              )}

              {values.phoneVerified && (
                <div className="success">Phone number verified.</div>
              )}

              {phoneError && <div className="error">{phoneError}</div>}
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