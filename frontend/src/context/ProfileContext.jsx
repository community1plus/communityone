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
  if (!user) return null;
  if (typeof user === "string") return user;

  return (
    user?.id ||
    user?.userId ||
    user?.username ||
    user?.sub ||
    user?.attributes?.sub ||
    user?.attributes?.email ||
    user?.signInDetails?.loginId ||
    user?.email ||
    null
  );
}

function getProfileCacheKey(userKey) {
  return `${PROFILE_CACHE_PREFIX}:${userKey}`;
}

function readProfileCache(userKey) {
  if (!userKey) return null;

  try {
    const cached = JSON.parse(
      localStorage.getItem(getProfileCacheKey(userKey))
    );

    if (!cached?.cachedAt) return null;

    return Date.now() - cached.cachedAt < PROFILE_CACHE_TTL
      ? cached
      : null;
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
    // ignore cache failure
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
    // ignore cache failure
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
  return Boolean(profile && Object.keys(profile).length > 0);
}

function getClientEndpointDetails() {
  const endpoint = {
    deviceName: navigator.platform || "",

    deviceType: /Mobi|Android|iPhone|iPad/i.test(
      navigator.userAgent
    )
      ? "mobile"
      : "desktop",

    userAgent: navigator.userAgent || "",

    platform: navigator.platform || "",

    language: navigator.language || "",

    timezone:
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "",

    screen: {
      width: window.screen?.width || null,
      height: window.screen?.height || null,
    },

    viewport: {
      width: window.innerWidth || null,
      height: window.innerHeight || null,
    },

    capturedAt: new Date().toISOString(),
  };

  console.log(
    "🖥️ CLIENT ENDPOINT DETAILS",
    endpoint
  );

  return endpoint;
}

export function ProfileProvider({ children }) {
  const api = useAPI();
  const {
  user,
  isAuthenticated,
  loading,
  authLoading,
} = useAuth();

const authReady = !loading && !authLoading;

  const userKey = getUserKey(user);

  const cachedOnRender =
    isAuthenticated && userKey
      ? readProfileCache(userKey)
      : null;

  const apiRef = useRef(api);
  const loadingRef = useRef(false);

  const [profile, setProfile] = useState(cachedOnRender?.profile || null);

  const [providers, setProviders] = useState(
    normaliseProviders(cachedOnRender?.providers || {})
  );

const [profileLoading, setProfileLoading] = useState(
  Boolean(!authReady || (isAuthenticated && !cachedOnRender))
);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const markProfileReady = useCallback(
    (nextProfile = null, nextProviders = {}, missing = false) => {
      console.log("markProfileReady()", {
        nextProfile,
        missing,
      });

      setProfile(nextProfile);
      setProviders(normaliseProviders(nextProviders));
      setProfileMissing(missing);
      setProfileError(null);
      setProfileLoading(false);
    },
    []
  );

  const loadProfile = useCallback(

    
    async ({ background = false } = {}) => {

      if (!authReady) {
        setProfile(null);
        setProviders(normaliseProviders());
        setProfileMissing(false);
        setProfileError(null);
        setProfileLoading(true);
      return null;
}
      if (loadingRef.current) return null;

      if (!isAuthenticated) {
        loadingRef.current = false;

        setProfile(null);
        setProviders(normaliseProviders());
        setProfileMissing(false);
        setProfileError(null);
        setProfileLoading(false);

        clearProfileCache();

        return null;
      }

      loadingRef.current = true;

      if (!background) {
        setProfileLoading(true);
      }

try {
  const headers = await getAuthHeaders();

  const res = await apiRef.current.get("/me", {
    headers,
  });

  const payload = normaliseApiResponse(res);

  console.log("RAW /me RESPONSE", res);
  console.log("NORMALISED PAYLOAD", payload);

  const nextProfile = payload?.profile || null;
  const nextProviders = payload?.providers || {};

  console.log("PROFILE FROM API", nextProfile);

  writeProfileCache(userKey, nextProfile, nextProviders);

  markProfileReady(
    nextProfile,
    nextProviders,
    !nextProfile
  );

  return nextProfile;
      } catch (err) {
        if (isNotFoundError(err)) {
          clearProfileCache(userKey);

          markProfileReady(null, {}, true);

          return null;
        }

        console.error("Profile load failed:", err);

        setProfileError(err?.message || "Profile load failed");
        setProfileLoading(false);

        return null;
      } finally {
        loadingRef.current = false;
      }
    },
    [authReady,isAuthenticated, userKey, markProfileReady]
  );

  useEffect(() => {
    loadingRef.current = false;

    if (!isAuthenticated) {
      setProfile(null);
      setProviders(normaliseProviders());
      setProfileMissing(false);
      setProfileError(null);
      setProfileLoading(false);

      clearProfileCache();

      return;
    }

    const cached = userKey ? readProfileCache(userKey) : null;

    if (cached) {
      setProfile(cached.profile || null);
      setProviders(normaliseProviders(cached.providers || {}));
      setProfileMissing(!cached.profile);
      setProfileError(null);
      setProfileLoading(false);

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

    loadProfile({
      background: false,
    });
  }, [authReady, isAuthenticated, userKey, loadProfile]);

  const saveProfile = useCallback(
    async (nextProfile) => {
      if (!isAuthenticated) {
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

const payloadToSave = {
  ...nextProfile,
  endpoint: getClientEndpointDetails(),
};

console.log("💾 PROFILE SAVE PAYLOAD", payloadToSave);

const res = await apiRef.current.put("/profile", payloadToSave, {
  headers,
});

        const payload = normaliseApiResponse(res);

        const savedProfile = payload?.profile || nextProfile;
        const nextProviders = payload?.providers || providers;

        setProfile(savedProfile);
        setProviders(normaliseProviders(nextProviders));
        setProfileMissing(false);
        setProfileLoading(false);

        writeProfileCache(userKey, savedProfile, nextProviders);

        return savedProfile;
      } catch (err) {
        const status = err?.response?.status || err?.status;

        if (status === 409) {
          const serverProfile = err?.response?.data?.serverProfile;

          if (serverProfile) {
            setProfile(serverProfile);
            setProfileMissing(false);
            setProfileLoading(false);

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
      if (!isAuthenticated) {
        throw new Error("User is not authenticated");
      }

      setProfileSaving(true);
      setProfileError(null);

      try {
        const headers = await getAuthHeaders({
          "x-version": profile?.version ? String(profile.version) : "",
        });

const payloadToPatch = {
  ...patch,
  endpoint: getClientEndpointDetails(),
};

console.log(
  "🩹 PROFILE PATCH PAYLOAD",
  payloadToPatch
);

const res = await apiRef.current.patch(
  "/profile",
  payloadToPatch,
  { headers }
);



        const payload = normaliseApiResponse(res);

        const savedProfile =
          payload?.profile || {
            ...profile,
            ...patch,
          };

        const nextProviders = payload?.providers || providers;

        setProfile(savedProfile);
        setProviders(normaliseProviders(nextProviders));
        setProfileMissing(false);
        setProfileLoading(false);

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

  const hasProfile = profileHasMinimumFields(profile);

  const isProfileComplete =
    hasProfile &&
    completionPercent >= 80;

  console.log("PROFILE CONTEXT STATE", {
    userKey,
    profile,
    hasProfile,
    profileMissing,
    profileLoading,
    profileReady,
    completionPercent,
  });

  useEffect(() => {
    console.log("PROFILE STATE CHANGED", {
      profile,
      hasProfile,
      profileMissing,
      profileLoading,
      profileReady,
    });
  }, [
    profile,
    hasProfile,
    profileMissing,
    profileLoading,
    profileReady,
  ]);

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