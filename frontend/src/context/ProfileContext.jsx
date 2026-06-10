import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchAuthSession } from "aws-amplify/auth";
import { useAuth } from "./AuthContext";
import useAPI from "../../hooks/useAPI";

const ProfileContext = createContext(null);

const PROFILE_CACHE_PREFIX = "communityone_profile_cache";
const PROFILE_CACHE_TTL = 1000 * 60 * 10;

const REQUIRED_PROFILE_FIELDS = [
  "userType",
  "displayName",
  "homeLocation",
  "phone",
];

function getUserKey(user) {
  return (
    user?.id ||
    user?.userId ||
    user?.username ||
    user?.sub ||
    user?.signInDetails?.loginId ||
    null
  );
}

function getProfileCacheKey(userKey) {
  return `${PROFILE_CACHE_PREFIX}:${userKey || "anonymous"}`;
}

function readProfileCache(userKey) {
  if (!userKey) return null;

  try {
    const cached = JSON.parse(
      localStorage.getItem(getProfileCacheKey(userKey))
    );

    if (!cached?.cachedAt) return null;

    const fresh = Date.now() - cached.cachedAt < PROFILE_CACHE_TTL;

    return fresh ? cached : null;
  } catch {
    return null;
  }
}

function writeProfileCache(userKey, profile, providers) {
  if (!userKey) return;

  try {
    localStorage.setItem(
      getProfileCacheKey(userKey),
      JSON.stringify({
        profile,
        providers,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // ignore
  }
}

function clearProfileCache(userKey) {
  try {
    if (userKey) {
      localStorage.removeItem(getProfileCacheKey(userKey));
      return;
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(PROFILE_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // ignore
  }
}

async function getAuthHeaders(extraHeaders = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

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

function isNotFoundError(err) {
  const status = err?.response?.status || err?.status;
  const data = err?.response?.data;

  return (
    status === 404 ||
    data?.error === "Profile not found" ||
    data?.profile === null
  );
}

function normaliseProviders(providers = {}) {
  const result = {};

  ["facebook", "instagram", "youtube", "x"].forEach((key) => {
    if (providers?.[key] && typeof providers[key] === "object") {
      result[key] = providers[key];
    }
  });

  return result;
}

function normaliseApiResponse(res) {
  return res?.data || res || {};
}

function profileHasMinimumFields(profile) {
  if (!profile) return false;

  return Boolean(
    profile?.id ||
      profile?.userId ||
      profile?.user_id ||
      profile?.username ||
      profile?.displayName ||
      profile?.display_name ||
      profile?.accountType ||
      profile?.userType
  );
}

export function ProfileProvider({ children }) {
  const api = useAPI();

  const { user, isAuthenticated } = useAuth();

  const userKey = getUserKey(user);

  const cachedOnRender =
    isAuthenticated && userKey ? readProfileCache(userKey) : null;

  const apiRef = useRef(api);
  const hasLoadedRef = useRef(Boolean(cachedOnRender));
  const loadingRef = useRef(false);

  const [profile, setProfile] = useState(cachedOnRender?.profile || null);

  const [providers, setProviders] = useState(
    normaliseProviders(cachedOnRender?.providers || {})
  );

  const [profileLoading, setProfileLoading] = useState(
    Boolean(isAuthenticated && userKey && !cachedOnRender)
  );

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const markProfileReady = useCallback(
    (nextProfile = null, nextProviders = {}, missing = false) => {
      setProfile(nextProfile);
      setProviders(normaliseProviders(nextProviders));
      setProfileMissing(missing);
      setProfileError(null);
      hasLoadedRef.current = true;
    },
    []
  );

  const loadProfile = useCallback(
    async ({ background = false } = {}) => {
      if (loadingRef.current) return null;

      if (!isAuthenticated || !userKey) {
        loadingRef.current = false;

        setProfile(null);
        setProviders(normaliseProviders());
        setProfileMissing(false);
        setProfileError(null);
        setProfileLoading(false);

        clearProfileCache();

        hasLoadedRef.current = true;

        return null;
      }

      loadingRef.current = true;

      if (!background) {
        setProfileLoading(true);
      }

      setProfileError(null);

      try {
        const headers = await getAuthHeaders();

        const res = await apiRef.current.get("/me", {
          headers,
        });

        const payload = normaliseApiResponse(res);

console.log("RAW /me RESPONSE", res);
console.log("NORMALISED PAYLOAD", payload);
console.log("PROFILE FROM API", payload?.profile);

        const nextProfile = payload?.profile || null;
        const nextProviders = payload?.providers || {};

        writeProfileCache(userKey, nextProfile, nextProviders);

        markProfileReady(nextProfile, nextProviders, !nextProfile);

        return nextProfile;
      } catch (err) {
        if (isNotFoundError(err)) {
          clearProfileCache(userKey);

          markProfileReady(null, {}, true);

          return null;
        }

        console.error("Profile load failed:", err);

        setProfileError(err?.message || "Profile load failed");
        hasLoadedRef.current = true;

        return null;
      } finally {
        loadingRef.current = false;
        setProfileLoading(false);
      }
    },
    [isAuthenticated, userKey, markProfileReady]
  );

  useEffect(() => {
    hasLoadedRef.current = false;
    loadingRef.current = false;

    if (!isAuthenticated || !userKey) {
      setProfile(null);
      setProviders(normaliseProviders());
      setProfileMissing(false);
      setProfileError(null);
      setProfileLoading(false);

      clearProfileCache();

      return;
    }

    const cached = readProfileCache(userKey);

    if (cached) {
      setProfile(cached.profile || null);
      setProviders(normaliseProviders(cached.providers || {}));
      setProfileMissing(!cached.profile);
      setProfileError(null);
      setProfileLoading(false);

      hasLoadedRef.current = true;

      loadProfile({
        background: true,
      });

      return;
    }

    setProfile(null);
    setProviders(normaliseProviders());
    setProfileMissing(false);
    setProfileError(null);
    setProfileLoading(true);
  }, [isAuthenticated, userKey, loadProfile]);

  useEffect(() => {
    if (!isAuthenticated || !userKey) return;
    if (hasLoadedRef.current) return;
    if (loadingRef.current) return;

    loadProfile();
  }, [isAuthenticated, userKey, loadProfile]);

  const saveProfile = useCallback(
    async (nextProfile) => {
      if (!isAuthenticated || !userKey) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      const previousProfile = profile;

      try {
        const headers = await getAuthHeaders({
          "x-version": previousProfile?.version
            ? String(previousProfile.version)
            : "",
        });

        const res = await apiRef.current.put("/profile", nextProfile, {
          headers,
        });

        const payload = normaliseApiResponse(res);

        const savedProfile = payload?.profile || nextProfile;
        const nextProviders = payload?.providers || providers;

        setProfile(savedProfile);
        setProviders(normaliseProviders(nextProviders));
        setProfileMissing(false);
        hasLoadedRef.current = true;

        writeProfileCache(userKey, savedProfile, nextProviders);

        return savedProfile;
      } catch (err) {
        const status = err?.response?.status || err?.status;

        if (status === 409) {
          const serverProfile = err?.response?.data?.serverProfile;

          if (serverProfile) {
            setProfile(serverProfile);
            setProfileMissing(false);
            hasLoadedRef.current = true;

            writeProfileCache(userKey, serverProfile, providers);

            return serverProfile;
          }
        }

        console.error("Profile save failed:", err);

        setProfileError(err?.message || "Profile save failed");

        throw err;
      } finally {
        setProfileSaving(false);
      }
    },
    [isAuthenticated, userKey, profile, providers]
  );

  const patchProfile = useCallback(
    async (patch) => {
      if (!isAuthenticated || !userKey) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      try {
        const headers = await getAuthHeaders({
          "x-version": profile?.version ? String(profile.version) : "",
        });

        const res = await apiRef.current.patch("/profile", patch, {
          headers,
        });

        const payload = normaliseApiResponse(res);

        const savedProfile = payload?.profile || {
          ...profile,
          ...patch,
        };

        const nextProviders = payload?.providers || providers;

        setProfile(savedProfile);
        setProviders(normaliseProviders(nextProviders));
        setProfileMissing(false);
        hasLoadedRef.current = true;

        writeProfileCache(userKey, savedProfile, nextProviders);

        return savedProfile;
      } catch (err) {
        console.error("Profile patch failed:", err);

        setProfileError(err?.message || "Profile patch failed");

        throw err;
      } finally {
        setProfileSaving(false);
      }
    },
    [isAuthenticated, userKey, profile, providers]
  );

  const completionPercent = useMemo(
    () => calculateCompletion(profile),
    [profile]
  );

  const profileReady = !profileLoading;

  console.log("PROFILE OBJECT", profile);
  console.log("PROFILE TYPE", typeof profile);

  const hasProfile = profileHasMinimumFields(profile);

  const isProfileComplete = hasProfile && completionPercent >= 80;

  const value = useMemo(
    () => ({
      profile,
      setProfile,

      providers,
      setProviders,

      profileLoading,
      profileReady,

      profileSaving,

      profileError,
      profileMissing,

      completionPercent,

      hasProfile,
      isProfileComplete,

      loadProfile,
      saveProfile,
      patchProfile,
    }),
    [
      profile,
      providers,
      profileLoading,
      profileReady,
      profileSaving,
      profileError,
      profileMissing,
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