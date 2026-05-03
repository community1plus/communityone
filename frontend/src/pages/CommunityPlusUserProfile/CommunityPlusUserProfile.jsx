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

export default function CommunityPlusUserProfile({ mode = "edit", onComplete }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { isLoaded } = useGoogleMaps();
  const { appUser, setAppUser } = useAuth();
  const { homeLocation, setViewLocation } = useLocationContext();

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
      social: { instagram: "" },
    },
    persistKey: "profile-form",
  });

  const { values, validateAll, setValue, isFormValidating, clearStorage } = form;

  const trackedValues = useMemo(
    () => ({ ...values, homeLocation }),
    [values, homeLocation]
  );

  const { dirtyFields, resetDirty } = useDirtyFields(trackedValues);
  const hasDirty = Object.keys(dirtyFields).length > 0;

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("profile-step");
    if (saved) setCurrentStep(Number(saved));
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

    setViewLocation(
      {
        label: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        type: "home",
      },
      "auto"
    );
  }, [setViewLocation]);

  useAutosave({
    data: dirtyFields,
    enabled: !!homeLocation && hasDirty,

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

  const profileSteps = [
  {
    id: "basic",
    fields: [
      { name: "username", label: "Username", type: "text" },
      { name: "display_name", label: "Display Name", type: "text" },
    ],
  },
  {
    id: "account",
    fields: [
      {
        name: "userType",
        label: "Account Type",
        type: "select",
        options: [
          { value: "PERSONAL", label: "Personal" },
          { value: "BUSINESS", label: "Business" },
        ],
      },
      { name: "phone", label: "Phone", type: "text" },
    ],
  },
  {
    id: "social",
    fields: [
      { name: "social.instagram", label: "Instagram", type: "text" },
    ],
  },
  {
    id: "location",
    fields: [
      { name: "homeLocation", label: "Home Location", type: "location" },
    ],
  },
];
  const nextStep = () => setCurrentStep((step) => Math.min(3, step + 1));
  const prevStep = () => setCurrentStep((step) => Math.max(0, step - 1));

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-page-header">
            <PageHeader
              title={mode === "onboarding" ? "Set Up Profile" : "Edit Profile"}
            />
          </div>

          <Section>
 
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
                onClick={currentStep < 3 ? nextStep : handleComplete}
                disabled={isFormValidating}
              >
                {currentStep < 3 ? "Next" : "Finish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="profile-guide">
          <Section
            title="Profile Guide"
            meta="Complete all steps to unlock features"
          />
        </div>
      </div>
    </div>
  );
}