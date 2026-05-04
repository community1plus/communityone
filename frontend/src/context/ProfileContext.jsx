import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

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
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      // Replace this with your real API call later.
      const stored = localStorage.getItem(`profile:${user.id}`);
      const parsed = stored ? JSON.parse(stored) : null;

      setProfile(parsed);
      return parsed;
    } catch (err) {
      console.error("Profile load failed:", err);
      setProfileError("Profile load failed");
      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const saveProfile = useCallback(
    async (nextProfile) => {
      if (!user?.id) return null;

      const merged = {
        ...profile,
        ...nextProfile,
        updatedAt: Date.now(),
      };

      localStorage.setItem(`profile:${user.id}`, JSON.stringify(merged));
      setProfile(merged);

      return merged;
    },
    [user?.id, profile]
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
      profileError,
      completionPercent,
      hasProfile,

      loadProfile,
      saveProfile,
      setProfile,
    }),
    [
      profile,
      profileLoading,
      profileError,
      completionPercent,
      hasProfile,
      loadProfile,
      saveProfile,
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