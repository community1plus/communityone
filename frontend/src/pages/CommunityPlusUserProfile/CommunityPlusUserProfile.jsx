import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";

import { api } from "../../services/api";

import PageHeader from "../../components/UI/PageHeader";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";

import FormBuilder from "../../components/UI/Form/FormBuilder";
import useForm from "../../hooks/useForm";

import "../../styles/system.css";
import "./CommunityPlusUserProfile.css";

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
    fields: [{ name: "homeLocation", label: "Home Location", type: "location" }],
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
];

/* =========================
   VALIDATOR
========================= */

const buildValidator = (steps) => (values) => {
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

/* =========================
   COMPONENT
========================= */

export default function CommunityPlusUserProfile() {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser, setAppUser, user } = useAuth();
  const { homeLocation, setHome } = useLocationContext();

  const validate = useMemo(() => buildValidator(PROFILE_STEPS), []);

  const form = useForm({
    initialValues: {
      username: "",
      display_name: "",
      userType: "PERSONAL",
      phone: "",
      social: { instagram: "" },
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
     COMPLETION %
  ========================= */

  const completion = useMemo(() => {
    let filled = 0;
    let total = 0;

    PROFILE_STEPS.forEach((step) => {
      step.fields.forEach((f) => {
        total++;
        const val = f.name.split(".").reduce((a, k) => a?.[k], values);
        if (val) filled++;
      });
    });

    return Math.round((filled / total) * 100);
  }, [values]);

  /* =========================
     STEP PERSISTENCE
  ========================= */

  useEffect(() => {
    const saved = localStorage.getItem("profile-step");
    if (saved) setCurrentStep(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("profile-step", currentStep);
  }, [currentStep]);

  /* =========================
     PREFILL
  ========================= */

  useEffect(() => {
    if (!appUser?.user) return;

    const email = appUser.user.email || "";
    const prefix = email.split("@")[0];

    if (!values.username) {
      setValue("username", prefix);
    }
  }, [appUser?.user?.email, values.username, setValue]);

  /* =========================
     GOOGLE
  ========================= */

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  const onPlaceChanged = useCallback(() => {
    const place = autoRef.current?.getPlace();
    if (!place?.geometry) return;

    const loc = {
      label: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setManualAddress(loc.label);
    setHome(loc);
  }, [setHome]);

  /* =========================
     VALIDATION
  ========================= */

  const validateStep = useCallback(async () => {
    const stepFields = PROFILE_STEPS[currentStep].fields;
    stepFields.forEach((f) => setTouched(f.name, true));

    const isValid = await validateAll();
    const hasErrors = stepFields.some((f) => getError(f.name));

    return isValid && !hasErrors;
  }, [currentStep, validateAll, getError, setTouched]);

  const nextStep = async () => {
    if (await validateStep()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () =>
    setCurrentStep((s) => Math.max(s - 1, 0));

  /* =========================
     AUTOSAVE
  ========================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("profile-draft", JSON.stringify(values));
    }, 500);

    return () => clearTimeout(timeout);
  }, [values]);

  /* =========================
     🔥 SAVE (HARDENED)
  ========================= */

  const handleSave = useCallback(async () => {
    if (saving) return;

    const isValid = await validateAll();
    if (!isValid) return;

    try {
      setSaving(true);
      setError("");

      if (!user?.token) {
        throw new Error("Authentication required");
      }

      if (!homeLocation) {
        throw new Error("Please select a valid location");
      }

      const data = await api.post(
        "/profile",
        {
          ...values,
          homeLocation,
        },
        user.token
      );

      clearStorage();
      localStorage.removeItem("profile-draft");
      localStorage.removeItem("profile-step");

      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: data,
      }));

      navigate("/home", { replace: true });

    } catch (err) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [values, homeLocation, user?.token, validateAll, saving]);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="profile-container">
      <div className="profile-layout">

        <div className="profile-left">

          <div className="profile-page-header">
            <PageHeader
              title="Edit Profile"
              meta={`Completion: ${completion}%`}
            />

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
                      onClick={async () => {
                        if (i > currentStep && !(await validateStep())) return;
                        setCurrentStep(i);
                      }}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
                  {saving
                    ? "Saving..."
                    : isFormValidating
                    ? "Validating..."
                    : "Save"}
                </Button>
              )}
            </div>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="profile-guide">
          <Section
            title="Profile Guide"
            meta="Complete all steps to unlock full platform features"
          />
        </div>

      </div>
    </div>
  );
}