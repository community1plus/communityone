import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@react-google-maps/api";

import { useGoogleMaps } from "../../context/GoogleMapsProvider";
import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import useAPI from "../../../hooks/useAPI";
import useAutosave from "../../../hooks/useAutosave";
import useOptimisticUpdate from "../../hooks/useOptimisticUpdate";
import useDirtyFields from "../../../hooks/useDirtyFields";
import { buildPatch } from "../../utils/buildPatch";

import PageHeader from "../../components/UI/PageHeader";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";
import FormBuilder from "../../components/UI/Form/FormBuilder";
import useForm from "../../hooks/useForm";

import "../../styles/system.css";
import "./CommunityPlusUserProfile.css";

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const profileSteps = [
  {
    id: "user",
    title: "USER",
    fields: [
      { name: "username", label: "Username", type: "text", required: true },
      {
        name: "display_name",
        label: "Display Name",
        type: "text",
        required: true,
      },
      {
        name: "userType",
        label: "User Type",
        type: "select",
        required: true,
        options: [
          { value: "PERSONAL", label: "Personal" },
          { value: "BUSINESS", label: "Business" },
          { value: "GOVT", label: "Government" },
          {
            value: "COMMUNITY_SERVICES",
            label: "Community Services",
          },
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
        type: "text",
        required: true,
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
      {
        name: "payment.cardName",
        label: "Name on Card",
        type: "text",
      },
      {
        name: "payment.last4",
        label: "Card Last 4 Digits",
        type: "text",
      },
    ],
  },
];

export default function CommunityPlusUserProfile({ mode = "edit", onComplete }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { isLoaded } = useGoogleMaps();
  const { appUser, setAppUser } = useAuth();
  const { viewLocation: homeLocation, setManualLocation } =
    useLocationContext();

  const api = useAPI();
  const optimistic = useOptimisticUpdate();

  const startSaving = () => {};
  const stopSaving = () => {};

  const form = useForm({
    initialValues: {
      username: "",
      display_name: "",
      userType: "PERSONAL",
      phone: "",
      social: {
        twitter: "",
        facebook: "",
        instagram: "",
        youtube: "",
      },
      payment: {
        cardName: "",
        last4: "",
      },
    },
    persistKey: "profile-form",
  });

  const { values, validateAll, setValue, isFormValidating, clearStorage } =
    form;

  const [currentStep, setCurrentStep] = useState(0);

  const currentStepConfig = profileSteps[currentStep];
  const isLastStep = currentStep === profileSteps.length - 1;

  const trackedValues = useMemo(
    () => ({ ...values, homeLocation }),
    [values, homeLocation]
  );

  const { dirtyFields, resetDirty } = useDirtyFields(trackedValues);
  const hasDirty = Object.keys(dirtyFields).length > 0;

  const profileCompletion = useMemo(() => {
    const requiredFields = profileSteps.flatMap((step) =>
      step.fields.filter((field) => field.required)
    );

    if (!requiredFields.length) return 100;

    const completed = requiredFields.filter((field) => {
      if (field.name === "homeLocation") {
        return Boolean(homeLocation?.lat && homeLocation?.lng);
      }

      const value = getNestedValue(values, field.name);
      return Boolean(String(value || "").trim());
    }).length;

    return Math.round((completed / requiredFields.length) * 100);
  }, [values, homeLocation]);

  useEffect(() => {
    const saved = localStorage.getItem("profile-step");
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed)) {
        setCurrentStep(Math.min(parsed, profileSteps.length - 1));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("profile-step", currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (!appUser?.user?.email) return;

    const prefix = appUser.user.email.split("@")[0];
    setValue("username", (prev) => prev || prefix);
  }, [appUser?.user?.email, setValue]);

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

  useAutosave({
    data: dirtyFields,
    enabled: hasDirty,

    onSave: async () => {
      const key = "profile-autosave";
      let opId = null;

      try {
        startSaving();

        const patch = buildPatch(dirtyFields);

        const { nextState, opId: id } = optimistic.applyOptimistic(
          key,
          appUser,
          (prev) => ({
            ...prev,
            profile: {
              ...prev?.profile,
              ...patch,
            },
          })
        );

        opId = id;
        setAppUser(nextState);

        const res = await api.patch("/profile", patch, {
          version: appUser?.profile?.version,
          dedupeKey: key,
          silent: true,
        });

        optimistic.commit(key, opId);

        if (res?.profile) {
          setAppUser((prev) => ({
            ...prev,
            profile: res.profile,
          }));
        }

        resetDirty();
      } catch (err) {
        if (err?.status === 409) {
          const serverProfile = err.data?.serverProfile;

          if (serverProfile) {
            setAppUser((prev) => ({
              ...prev,
              profile: serverProfile,
            }));
          }

          resetDirty();
          return;
        }

        if (opId) {
          const prev = optimistic.rollback(key, opId);
          if (prev) setAppUser(prev);
        }
      } finally {
        stopSaving();
      }
    },
  });

  const handleComplete = useCallback(async () => {
    const valid = await validateAll();
    if (!valid) return;

    const key = "profile-complete";
    let opId = null;

    try {
      startSaving();

      const { nextState, opId: id } = optimistic.applyOptimistic(
        key,
        appUser,
        (prev) => ({
          ...prev,
          hasProfile: true,
        })
      );

      opId = id;
      setAppUser(nextState);

      const res = await api.post("/profile/complete", {
        ...values,
        homeLocation,
      });

      optimistic.commit(key, opId);

      clearStorage();
      localStorage.removeItem("profile-step");

      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: res?.profile || prev?.profile,
      }));

      if (mode === "onboarding") {
        navigate("/communityplus", { replace: true });
      }

      onComplete?.(res);
    } catch (err) {
      if (opId) {
        const prev = optimistic.rollback(key, opId);
        if (prev) setAppUser(prev);
      }
    } finally {
      stopSaving();
    }
  }, [
    validateAll,
    optimistic,
    appUser,
    setAppUser,
    api,
    values,
    homeLocation,
    clearStorage,
    mode,
    navigate,
    onComplete,
  ]);

  const nextStep = useCallback(() => {
    setCurrentStep((step) => Math.min(profileSteps.length - 1, step + 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-page-header">
            <PageHeader title="USER PROFILE" />

            <div className="profile-completion">
              <div className="profile-completion-header">
                <span>Profile completion</span>
                <strong>{profileCompletion}%</strong>
              </div>

              <div className="profile-completion-track">
                <div
                  className="profile-completion-fill"
                  style={{ width: `${profileCompletion}%` }}
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

          <div className="form-navigation">
            <Button variant="ghost" onClick={() => navigate("/communityplus")}>
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
                disabled={isFormValidating}
              >
                {isLastStep ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </div>

        <div className="profile-guide">
          <Section
            title="Profile Guide"
            meta="Complete each section to unlock more Community+ features."
          />
        </div>
      </div>
    </div>
  );
}