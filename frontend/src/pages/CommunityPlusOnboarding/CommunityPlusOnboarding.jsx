import { useCallback } from "react";

import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../../hooks/useAPI";
import useAPI from "../../../hooks/useAPI";

import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";

/* =====================================================
   ONBOARDING WRAPPER (FULLY DECLARATIVE)
===================================================== */

export default function Onboarding() {
  const { setAppUser } = useAuth();
  const { startSaving, stopSaving } = useUI();
  const api = useAPI();

  /* =========================
     🔥 HANDLE SAVE (AUTOSAVE)
  ========================= */

  const handleSave = useCallback(
    async (data) => {
      startSaving();

      try {
        const res = await api.autosave(
          "/profile",
          data,
          "profile-onboarding"
        );

        if (res?.profile) {
          setAppUser((prev) => ({
            ...(prev || {}),
            profile: res.profile,
            hasProfile: true,
          }));
        }

        return res;

      } catch (err) {
        console.error("Autosave failed:", err);
        throw err;

      } finally {
        stopSaving();
      }
    },
    [api, startSaving, stopSaving, setAppUser]
  );

  /* =========================
     ✅ COMPLETE ONBOARDING
  ========================= */

  const handleComplete = useCallback(
    async (data) => {
      startSaving();

      try {
        const res = await api.post("/profile/complete", data);

        // 🔥 THIS is the only thing that matters
        setAppUser((prev) => ({
          ...(prev || {}),
          hasProfile: true,
          profile: res?.profile || prev?.profile || null,
        }));

        // ❌ NO NAVIGATION HERE

      } catch (err) {
        console.error("Onboarding complete failed:", err);
        throw err;

      } finally {
        stopSaving();
      }
    },
    [api, startSaving, stopSaving, setAppUser]
  );

  /* =========================
     RENDER
  ========================= */

  return (
    <CommunityPlusUserProfile
      mode="onboarding"
      onSave={handleSave}
      onComplete={handleComplete}
    />
  );
}