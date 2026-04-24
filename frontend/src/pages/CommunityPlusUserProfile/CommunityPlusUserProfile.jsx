import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import PageHeader from "../../components/UI/PageHeader";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";

import FormBuilder from "../../components/UI/Form/FormBuilder";
import useForm from "../../hooks/useForm";

import "../../styles/system.css";
import

const GOOGLE_LIBRARIES = ["places"];

/* =========================
   CONFIG
========================= */

const PROFILE_STEPS = [
  {
    title: "Identity",
    fields: [
      { name: "username", label: "Username", readOnly: true },
      {
        name: "userType",
        label: "Account Type",
        type: "select",
        options: [
          { value: "PERSONAL", label: "Personal" },
          { value: "BUSINESS", label: "Business" },
        ],
      },
    ],
  },
  {
    title: "Home",
    fields: [
      { name: "homeLocation", label: "Home Location", type: "location" },
    ],
  },
  {
    title: "Contact",
    fields: [
      {
        name: "phone",
        label: "Phone",
        validate: (v) => {
          if (!v) return "Phone required";
          if (!/^\d{8,15}$/.test(v)) return "Invalid phone";
          return null;
        },
      },
    ],
  },
  {
    title: "Social",
    fields: [
      {
        name: "social.instagram",
        label: "Instagram",
        validate: (v) =>
          v && !v.startsWith("@") ? "Must start with @" : null,
      },
    ],
  },
  {
    title: "Payment",
    fields: [
      {
        name: "card.number",
        label: "Card Number",
        validate: (v) =>
          v && v.length < 12 ? "Invalid card number" : null,
      },
    ],
  },
];

/* =========================
   VALIDATOR
========================= */

const buildValidator = (steps) => {
  return (values) => {
    const errors = {};

    const setIn = (obj, path, value) => {
      const keys = path.split(".");
      let curr = obj;

      keys.forEach((key, i) => {
        if (i === keys.length - 1) curr[key] = value;
        else {
          curr[key] = curr[key] || {};
          curr = curr[key];
        }
      });
    };

    steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (!field.validate) return;

        const value = field.name
          .split(".")
          .reduce((acc, key) => acc?.[key], values);

        const error = field.validate(value, values);
        if (error) setIn(errors, field.name, error);
      });
    });

    return errors;
  };
};

/* =========================
   COMPONENT
========================= */

export default function CommunityPlusUserProfile() {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser, setAppUser } = useAuth();
  const { homeLocation, setHome } = useLocationContext();

  const validate = useMemo(
    () => buildValidator(PROFILE_STEPS),
    []
  );

  const form = useForm({
    initialValues: {
      username: "",
      display_name: "",
      userType: "PERSONAL",
      phone: "",
      social: { instagram: "", twitter: "" },
      card: { number: "" },
    },
    validate,
    persistKey: "profile-form",
  });

  const {
    values,
    validateAll,
    setValue,
    isFormValidating,
    clearStorage,
    getError,
    setTouched,
  } = form;

  const [manualAddress, setManualAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = PROFILE_STEPS.map((s) => s.title);
  const progress = ((currentStep + 1) / PROFILE_STEPS.length) * 100;

  /* =========================
     PREFILL
  ========================= */

  useEffect(() => {
    if (!appUser?.user) return;

    const email = appUser.user.email || "";
    const prefix = email.split("@")[0];

    setValue("username", prefix);
    setValue("display_name", prefix.slice(0, 2).toUpperCase());
  }, [appUser?.user?.email]);

  /* =========================
     GOOGLE
  ========================= */

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  const onPlaceChanged = () => {
    const place = autoRef.current?.getPlace();
    if (!place?.geometry) return;

    const loc = {
      label: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setManualAddress(loc.label);
    setHome(loc);
  };

  /* =========================
     STEP VALIDATION
  ========================= */

  const validateStep = async () => {
    const stepFields = PROFILE_STEPS[currentStep].fields;

    stepFields.forEach((f) => setTouched(f.name, true));

    const isValid = await validateAll();
    const hasErrors = stepFields.some((f) => getError(f.name));

    return isValid && !hasErrors;
  };

  /* =========================
     NAVIGATION
  ========================= */

  const nextStep = async () => {
    const ok = await validateStep();
    if (!ok) return;

    setCurrentStep((s) => s + 1);
  };

  const prevStep = () =>
    setCurrentStep((s) => Math.max(s - 1, 0));

  /* =========================
     SAVE
  ========================= */

  const handleSave = async () => {
    const isValid = await validateAll();
    if (!isValid) return;

    try {
      setSaving(true);

      const res = await fetch(
        "https://communityone-backend.onrender.com/api/profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: appUser?.user?.id,
            ...values,
            homeLocation,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearStorage();

      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: data,
      }));

      navigate("/home", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="profile-container">

      {/* HEADER */}
      <div className="profile-page-header">
        <PageHeader
          title="Edit Profile"
          meta="Complete your profile to unlock platform features"
        />

        {/* STEPPER */}
        <div className="profile-stepper">

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="profile-page-steps">
            {steps.map((step, i) => {
              const active = i === currentStep;
              const complete = i < currentStep;

              return (
                <div
                  key={step}
                  className={`step ${active ? "active" : ""} ${complete ? "complete" : ""}`}
                  onClick={() => setCurrentStep(i)}
                >
                  {step}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* MAIN */}
      <div className="profile-layout">

        {/* LEFT */}
        <div className="profile-left">
          <Section>
            <FormBuilder
              steps={PROFILE_STEPS}
              currentStep={currentStep}
              form={form}
              extra={{
                Autocomplete,
                autoRef,
                manualAddress,
                setManualAddress,
                onPlaceChanged,
                isLoaded,
              }}
            />
          </Section>

          <div className="form-navigation">

            <Button variant="ghost" onClick={() => navigate("/home")}>
              Close
            </Button>

            <div className="form-actions">
              {currentStep > 0 && (
                <Button variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              )}

              {currentStep < PROFILE_STEPS.length - 1 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || isFormValidating}
                >
                  {isFormValidating ? "Validating..." : "Save"}
                </Button>
              )}
            </div>

          </div>

          {error && <div className="error">{error}</div>}
        </div>

        {/* RIGHT */}
        <div className="profile-guide">
          <Section
            title="Profile Guide"
            meta="Add details to improve visibility and trust"
          />
        </div>

      </div>
    </div>
  );
}