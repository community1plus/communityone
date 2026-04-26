import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import useAPI from "../../api/useAPI";

import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";

/* =====================================================
   ONBOARDING WRAPPER (🔥 ORCHESTRATOR)
===================================================== */

export default function Onboarding() {
  const navigate = useNavigate();

  const { setAppUser } = useAuth();
  const { startSaving, stopSaving } = useUI();
  const api = useAPI();

  /* =========================
     🔥 HANDLE SAVE (AUTOSAVE)
  ========================= */

  const handleSave = useCallback(
    async (data) => {
      startSaving();

      const res = await api.autosave(
        "/profile",
        data,
        "profile-onboarding"
      );

      stopSaving();

      // 🔥 sync global auth state
      if (res?.profile) {
        setAppUser((prev) => ({
          ...prev,
          profile: res.profile,
          hasProfile: true,
        }));
      }

      return res;
    },
    [api, startSaving, stopSaving, setAppUser]
  );

  /* =========================
     ✅ COMPLETE ONBOARDING
  ========================= */

  const handleComplete = useCallback(
    async (data) => {
      startSaving();

      const res = await api.post("/profile/complete", data);

      stopSaving();

      // 🔥 update global state
      setAppUser((prev) => ({
        ...prev,
        hasProfile: true,
        profile: res?.profile || prev?.profile,
      }));

      // 🔥 redirect into app
      navigate("/home", { replace: true });
    },
    [api, startSaving, stopSaving, setAppUser, navigate]
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <CommunityPlusUserProfile
      mode="onboarding"
      onSave={handleSave}        // 🔥 autosave hook
      onComplete={handleComplete} // 🔥 finish flow
    />
  );
}