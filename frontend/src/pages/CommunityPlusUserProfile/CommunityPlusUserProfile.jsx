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
      { name: "phone", label: "Phone Number", type: "text", required: true },
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

export default function CommunityPlusUserProfile({ mode = "edit", onComplete }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { isLoaded } = useGoogleMaps();
  const { user } = useAuth();

  const { viewLocation: homeLocation, setManualLocation } =
    useLocationContext();

  const {
    profile,
    completionPercent,
    hasProfile,
    saveProfile,
    patchProfile,
    loadProfile,
  } = useProfile();

  const form = useForm({
    initialValues: {
      username: profile?.username || "",
      display_name: profile?.display_name || user?.displayName || "",
      userType: profile?.userType || "PERSONAL",
      phone: profile?.phone || "",
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

  const currentStepConfig = profileSteps[currentStep];
  const isLastStep = currentStep === profileSteps.length - 1;

  const { autosaveStatus, autosaveError } = useProfileAutosave({
    values,
    homeLocation,
    patchProfile,
    enabled: Boolean(profile),
    delay: 900,
  });

  const displayCompletion = useMemo(() => completionPercent || 0, [completionPercent]);

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
  }, [setManualLocation]);

  const buildProfilePayload = useCallback(
    () => ({
      username: values.username,
      display_name: values.display_name,
      userType: values.userType,
      phone: values.phone,
      homeLocation,
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
      await loadProfile();

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
  }, [
    saveProfile,
    buildProfilePayload,
    loadProfile,
    clearStorage,
    onComplete,
    navigate,
  ]);

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
    if (!hasProfile) {
      navigate("/communityplus/profile", { replace: true });
      return;
    }

    navigate("/communityplus", { replace: true });
  }, [hasProfile, navigate]);

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