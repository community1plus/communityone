import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

import { useLocationContext } from "../../context/LocationProvider";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

import useAPI from "../hooks/useAPI";
import useAutosave from "../hooks/useAutosave";
import useOptimisticUpdate from "../hooks/useOptimisticUpdate";
import useDirtyFields from "../hooks/useDirtyFields";
import { buildPatch } from "../utils/buildPatch";

import PageHeader from "../../components/UI/PageHeader";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";
import FormBuilder from "../../components/UI/Form/FormBuilder";
import useForm from "../../hooks/useForm";

import "../../styles/system.css";
import "./CommunityPlusUserProfile.css";

const GOOGLE_LIBRARIES = ["places"];

export default function CommunityPlusUserProfile({ mode = "edit", onComplete }) {
  const navigate = useNavigate();
  const autoRef = useRef(null);

  const { appUser, setAppUser } = useAuth();
  const { homeLocation, setHome } = useLocationContext();
  const { startSaving, stopSaving } = useUI();

  const api = useAPI();
  const optimistic = useOptimisticUpdate();

  /* =========================
     FORM
  ========================= */

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

  /* =========================
     DIRTY TRACKING (MEMO SAFE)
  ========================= */

  const trackedValues = useMemo(
    () => ({ ...values, homeLocation }),
    [values, homeLocation]
  );

  const { dirtyFields, resetDirty } = useDirtyFields(trackedValues);

  const hasDirty = Object.keys(dirtyFields).length > 0;

  /* =========================
     STEP
  ========================= */

  const [currentStep, setCurrentStep] = useState(0);

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
    if (!appUser?.user?.email) return;

    const prefix = appUser.user.email.split("@")[0];
    setValue("username", (prev) => prev || prefix);
  }, [appUser?.user?.email, setValue]);

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

    setHome({
      label: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  }, [setHome]);

  /* =========================
     🔥 AUTOSAVE (VERSION SAFE)
  ========================= */

  useAutosave({
    data: dirtyFields,
    enabled: !!homeLocation && hasDirty,

    onSave: async () => {
      const key = "profile-autosave";
      let opId = null;

      try {
        startSaving();

        const patch = buildPatch(dirtyFields);

        /* 🔥 OPTIMISTIC */
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

        /* 🔥 VERSIONED PATCH */
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
        /* 🔥 CONFLICT HANDLING */
        if (err?.status === 409) {
          console.warn("⚠️ Version conflict");

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

        /* 🔥 ROLLBACK */
        if (opId) {
          const prev = optimistic.rollback(key, opId);
          if (prev) setAppUser(prev);
        }

      } finally {
        stopSaving();
      }
    },
  });

  /* =========================
     COMPLETE
  ========================= */

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
        navigate("/home", { replace: true });
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
  }, [values, homeLocation, validateAll, appUser]);

  /* =========================
     NAVIGATION
  ========================= */

  const nextStep = () =>
    setCurrentStep((s) => Math.min(3, s + 1));

  const prevStep = () =>
    setCurrentStep((s) => Math.max(0, s - 1));

  /* =========================
     RENDER
  ========================= */

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
            <Button variant="ghost" onClick={() => navigate("/home")}>
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