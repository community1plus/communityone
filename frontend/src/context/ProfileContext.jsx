import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import useAPI from "../../hooks/useAPI";

const ProfileContext = createContext(null);

const REQUIRED_PROFILE_FIELDS = [
  "userType",
  "display_name",
  "homeLocation",
  "phone",
];

function getValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function calculateCompletion(profile) {
  if (!profile) return 0;

  const completed = REQUIRED_PROFILE_FIELDS.filter((field) => {
    const value = getValue(profile, field);

    if (field === "homeLocation") {
      return Boolean(value?.lat && value?.lng);
    }

    return Boolean(String(value || "").trim());
  }).length;

  return Math.round((completed / REQUIRED_PROFILE_FIELDS.length) * 100);
}

export function ProfileProvider({ children }) {
  const api = useAPI();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const res = await api.get("/profile");

      const nextProfile = res?.profile || null;

      setProfile(nextProfile);
      return nextProfile;
    } catch (err) {
      if (err?.status === 404) {
        setProfile(null);
        return null;
      }

      console.error("Profile load failed:", err);
      setProfileError(err?.message || "Profile load failed");
      setProfile(null);

      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [api, isAuthenticated, user?.id]);

  const saveProfile = useCallback(
    async (nextProfile) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      const optimisticProfile = {
        ...profile,
        ...nextProfile,
        updatedAt: Date.now(),
      };

      setProfile(optimisticProfile);

      try {
        const res = await api.put("/profile", optimisticProfile);

        const savedProfile = res?.profile || optimisticProfile;

        setProfile(savedProfile);
        return savedProfile;
      } catch (err) {
        console.error("Profile save failed:", err);
        setProfile(profile);
        setProfileError(err?.message || "Profile save failed");

        throw err;
      } finally {
        setProfileSaving(false);
      }
    },
    [api, isAuthenticated, user?.id, profile]
  );

  const patchProfile = useCallback(
    async (patch) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      const optimisticProfile = {
        ...profile,
        ...patch,
        updatedAt: Date.now(),
      };

      setProfile(optimisticProfile);

      try {
        const res = await api.patch("/profile", patch);

        const savedProfile = res?.profile || optimisticProfile;

        setProfile(savedProfile);
        return savedProfile;
      } catch (err) {
        console.error("Profile patch failed:", err);
        setProfile(profile);
        setProfileError(err?.message || "Profile patch failed");

        throw err;
      } finally {
        setProfileSaving(false);
      }
    },
    [api, isAuthenticated, user?.id, profile]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const completionPercent = useMemo(
    () => calculateCompletion(profile),
    [profile]
  );

  const hasProfile = completionPercent === 100;

  const value = useMemo(
    () => ({
      profile,
      profileLoading,
      profileSaving,
      profileError,

      completionPercent,
      hasProfile,

      loadProfile,
      saveProfile,
      patchProfile,
      setProfile,
    }),
    [
      profile,
      profileLoading,
      profileSaving,
      profileError,
      completionPercent,
      hasProfile,
      loadProfile,
      saveProfile,
      patchProfile,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}