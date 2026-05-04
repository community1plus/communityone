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
      phone: profile?.phone || "",
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
    if (!values.phone) return;

    if (profile?.phone && values.phone !== profile.phone) {
      setValue("phoneVerified", false);
      setValue("phoneVerificationCode", "");
      setPhoneStatus("idle");
    }
  }, [values.phone, profile?.phone, setValue]);

  const sendPhoneCode = useCallback(async () => {
    if (!values.phone) {
      setPhoneError("Enter a phone number first.");
      return;
    }

    setPhoneStatus("sending");
    setPhoneError("");

    try {
      // TODO backend:
      // await api.post("/profile/phone/send-code", { phone: values.phone });

      console.log("Send phone verification code to:", values.phone);

      setPhoneStatus("sent");
    } catch (err) {
      setPhoneStatus("error");
      setPhoneError(err?.message || "Could not send verification code");
    }
  }, [values.phone]);

  const verifyPhoneCode = useCallback(async () => {
    if (!values.phoneVerificationCode) {
      setPhoneError("Enter the verification code.");
      return;
    }

    setPhoneStatus("verifying");
    setPhoneError("");

    try {
      // TODO backend:
      // await api.post("/profile/phone/verify-code", {
      //   phone: values.phone,
      //   code: values.phoneVerificationCode,
      // });

      console.log("Verify phone code:", {
        phone: values.phone,
        code: values.phoneVerificationCode,
      });

      setValue("phoneVerified", true);
      setPhoneStatus("verified");
    } catch (err) {
      setPhoneStatus("error");
      setPhoneError(err?.message || "Invalid verification code");
      setValue("phoneVerified", false);
    }
  }, [values.phone, values.phoneVerificationCode, setValue]);

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
      phone: values.phone,
      phoneVerified: values.phoneVerified,
      homeLocation: values.homeLocation || homeLocation,
      social: values.social,
      payment: values.payment,
    }),
    [values, homeLocation]
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
    setCurrentStep((step) => Math.min(profileSteps.length - 1, step + 1));
  }, []);

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
              <div className="form-actions">
                <Button
                  variant="ghost"
                  onClick={sendPhoneCode}
                  disabled={
                    !values.phone ||
                    phoneStatus === "sending" ||
                    values.phoneVerified
                  }
                >
                  {phoneStatus === "sending"
                    ? "Sending..."
                    : "Send verification code"}
                </Button>

                <Button
                  onClick={verifyPhoneCode}
                  disabled={
                    !values.phoneVerificationCode ||
                    phoneStatus === "verifying" ||
                    values.phoneVerified
                  }
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
                disabled={isFormValidating || savingProfile}
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