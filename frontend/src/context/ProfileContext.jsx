import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const hasLoadedRef = useRef(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      hasLoadedRef.current = false;
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const res = await api.get("/profile");
      const nextProfile = res?.profile || null;

      setProfile(nextProfile);
      hasLoadedRef.current = true;

      return nextProfile;
    } catch (err) {
      const status = err?.response?.status || err?.status;

      if (status === 404) {
        setProfile(null);
        hasLoadedRef.current = true;
        return null;
      }

      console.error("Profile load failed:", err);
      setProfile(null);
      setProfileError(err?.message || "Profile load failed");
      hasLoadedRef.current = true;

      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [api, isAuthenticated, user?.id]);

  useEffect(() => {
    if (hasLoadedRef.current && profile) return;

    loadProfile();
  }, [loadProfile, profile]);

  const saveProfile = useCallback(
    async (nextProfile) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      const previousProfile = profile;

      const optimisticProfile = {
        ...previousProfile,
        ...nextProfile,
        updatedAt: Date.now(),
      };

      setProfile(optimisticProfile);

      try {
        const res = await api.put("/profile", optimisticProfile, {
          headers: {
            "x-version": previousProfile?.version,
          },
        });

        const savedProfile = res?.profile || optimisticProfile;
        setProfile(savedProfile);

        return savedProfile;
      } catch (err) {
        const status = err?.response?.status || err?.status;

        if (status === 409) {
          const serverProfile = err?.response?.data?.serverProfile;

          if (serverProfile) {
            setProfile(serverProfile);
            return serverProfile;
          }
        }

        console.error("Profile save failed:", err);
        setProfile(previousProfile);
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

      const previousProfile = profile;

      const optimisticProfile = {
        ...previousProfile,
        ...patch,
        updatedAt: Date.now(),
      };

      setProfile(optimisticProfile);

      try {
        const res = await api.patch("/profile", patch, {
          headers: {
            "x-version": previousProfile?.version,
          },
        });

        const savedProfile = res?.profile || optimisticProfile;
        setProfile(savedProfile);

        return savedProfile;
      } catch (err) {
        const status = err?.response?.status || err?.status;

        if (status === 409) {
          const serverProfile = err?.response?.data?.serverProfile;

          if (serverProfile) {
            setProfile(serverProfile);
            return serverProfile;
          }
        }

        console.error("Profile patch failed:", err);
        setProfile(previousProfile);
        setProfileError(err?.message || "Profile patch failed");

        throw err;
      } finally {
        setProfileSaving(false);
      }
    },
    [api, isAuthenticated, user?.id, profile]
  );

  const completionPercent = useMemo(
    () => calculateCompletion(profile),
    [profile]
  );

  const profileReady = !profileLoading;
  const hasProfile = Boolean(profile);
  const isProfileComplete = hasProfile && completionPercent >= 80;

  const value = useMemo(
    () => ({
      profile,
      setProfile,

      profileLoading,
      profileReady,
      profileSaving,
      profileError,

      completionPercent,
      hasProfile,
      isProfileComplete,

      loadProfile,
      saveProfile,
      patchProfile,
    }),
    [
      profile,
      profileLoading,
      profileReady,
      profileSaving,
      profileError,
      completionPercent,
      hasProfile,
      isProfileComplete,
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