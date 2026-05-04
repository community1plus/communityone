import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";

import { useGoogleMaps } from "../../context/GoogleMapsProvider";
import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import useProfileAutosave from "../../hooks/useProfileAutosave";

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
    fields: [
      { name: "social.twitter", label: "Twitter / X", type: "text" },
      { name: "social.facebook", label: "Facebook", type: "text" },
      { name: "social.instagram", label: "Instagram", type: "text" },
      { name: "social.youtube", label: "YouTube", type: "text" },
    ],
  },
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

function formatLocalPhone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  const digits = stripDialCode(phone, countryCode);

  if (!digits) return "";

  if (country.code === "AU") {
    const local = digits.startsWith("4") ? `0${digits}` : digits;

    return local
      .slice(0, 10)
      .replace(/(\d{4})(\d{3})(\d{0,3})/, (_, a, b, c) =>
        c ? `${a} ${b} ${c}` : `${a} ${b}`
      );
  }

  if (country.code === "US" || country.code === "CA") {
    return digits
      .slice(0, 10)
      .replace(/(\d{3})(\d{3})(\d{0,4})/, (_, a, b, c) =>
        c ? `${a} ${b} ${c}` : `${a} ${b}`
      );
  }

  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

function toE164Phone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  let digits = stripDialCode(phone, countryCode);

  if (!digits) return "";

  if (country.code === "AU" && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return `${country.dialCode}${digits}`;
}

function isValidInternationalPhone(phone = "", countryCode = DEFAULT_PHONE_COUNTRY) {
  const country = getPhoneCountry(countryCode);
  const nationalDigits = stripDialCode(phone, countryCode);

  return (
    nationalDigits.length >= country.min &&
    nationalDigits.length <= country.max
  );
}

export default function CommunityPlusUserProfile({ onComplete }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { isLoaded } = useGoogleMaps();
  const { user } = useAuth();

  const { viewLocation: homeLocation, setManualLocation } =
    useLocationContext();

  const {
    profile,
    profileReady,
    completionPercent,
    hasProfile,
    saveProfile,
    patchProfile,
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
        twitter: profile?.social?.twitter || "",
        facebook: profile?.social?.facebook || "",
        instagram: profile?.social?.instagram || "",
        youtube: profile?.social?.youtube || "",
      },
      payment: {
        cardName: profile?.payment?.cardName || "",
        last4: profile?.payment?.last4 || "",
      },
    },
    persistKey: "profile-form",
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

  const selectedPhoneCountry = getPhoneCountry(values.phoneCountry);
  const phoneE164 = toE164Phone(values.phone, values.phoneCountry);
  const phoneIsValid = isValidInternationalPhone(values.phone, values.phoneCountry);
  const canContinueFromContact = !isContactStep || values.phoneVerified;

  const displayCompletion = useMemo(
    () => completionPercent || 0,
    [completionPercent]
  );

  const { autosaveStatus, autosaveError } = useProfileAutosave({
    values,
    homeLocation,
    patchProfile,
    enabled: Boolean(profileReady && profile),
    delay: 900,
  });

  useEffect(() => {
    const saved = localStorage.getItem("profile-step");
    if (!saved) return;

    const parsed = Number(saved);
    if (!Number.isNaN(parsed)) {
      setCurrentStep(Math.min(parsed, profileSteps.length - 1));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("profile-step", String(currentStep));
  }, [currentStep]);

  useEffect(() => {
    if (!user?.email) return;

    const prefix = user.email.split("@")[0];

    setValue("username", (prev) => prev || profile?.username || prefix);
    setValue(
      "display_name",
      (prev) => prev || profile?.display_name || user.displayName || prefix
    );
  }, [
    user?.email,
    user?.displayName,
    profile?.username,
    profile?.display_name,
    setValue,
  ]);

  useEffect(() => {
    if (!homeLocation) return;
    setValue("homeLocation", homeLocation);
  }, [homeLocation, setValue]);

  useEffect(() => {
    const formatted = formatLocalPhone(values.phone, values.phoneCountry);
    const e164 = toE164Phone(formatted, values.phoneCountry);

    if (formatted && formatted !== values.phone) {
      setValue("phone", formatted);
    }

    if (e164 !== values.phoneE164) {
      setValue("phoneE164", e164);
    }
  }, [values.phone, values.phoneCountry, values.phoneE164, setValue]);

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

  const sendPhoneCode = useCallback(async () => {
    const cleanPhone = toE164Phone(values.phone, values.phoneCountry);

    if (!cleanPhone) {
      setPhoneError("Enter your phone number first.");
      return;
    }

    if (!isValidInternationalPhone(values.phone, values.phoneCountry)) {
      setPhoneError(
        `Enter a valid phone number for ${selectedPhoneCountry.label}.`
      );
      return;
    }

    setPhoneStatus("sending");
    setPhoneError("");
    setValue("phoneVerificationCode", "");

    try {
      // Backend later:
      // await api.post("/profile/phone/send-code", {
      //   phone: cleanPhone,
      //   country: values.phoneCountry,
      // });

      console.log("Send verification code to:", cleanPhone);

      setPhoneStatus("sent");
    } catch (err) {
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
      // Backend later:
      // await api.post("/profile/phone/verify-code", {
      //   phone: toE164Phone(values.phone, values.phoneCountry),
      //   code: values.phoneVerificationCode,
      // });

      console.log("Verify phone code:", {
        phone: toE164Phone(values.phone, values.phoneCountry),
        code: values.phoneVerificationCode,
      });

      setValue("phoneVerified", true);
      setPhoneStatus("verified");
    } catch (err) {
      setValue("phoneVerified", false);
      setPhoneStatus("error");
      setPhoneError(err?.message || "Invalid verification code");
    }
  }, [
    phoneStatus,
    values.phone,
    values.phoneCountry,
    values.phoneVerificationCode,
    setValue,
  ]);

  const handlePhoneCountryChange = useCallback(
    (event) => {
      const nextCountry = event.target.value;
      const formatted = formatLocalPhone(values.phone, nextCountry);
      const e164 = toE164Phone(formatted, nextCountry);

      setValue("phoneCountry", nextCountry);
      setValue("phone", formatted);
      setValue("phoneE164", e164);
      setValue("phoneVerified", false);
      setValue("phoneVerificationCode", "");
      setPhoneStatus("idle");
      setPhoneError("");
    },
    [values.phone, setValue]
  );

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
      payment: values.payment,
    }),
    [values, phoneE164, homeLocation]
  );

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    setProfileError("");

    try {
      const nextProfile = await saveProfile(buildProfilePayload());

      clearStorage();
      localStorage.removeItem("profile-step");

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

            <div className={`profile-save-status ${autosaveStatus}`}>
              {autosaveStatus === "saving" && "Saving..."}
              {autosaveStatus === "saved" && "Saved"}
              {autosaveStatus === "error" &&
                (autosaveError || "Autosave failed")}
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

          <Section title={currentStepConfig?.title}>
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

          {(profileError || autosaveStatus === "error") && (
            <div className="error">
              {profileError || autosaveError || "Profile save failed"}
            </div>
          )}

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
            meta="Complete each required section to unlock Community.One features. Changes are saved automatically."
          />
        </div>
      </div>
    </div>
  );
}