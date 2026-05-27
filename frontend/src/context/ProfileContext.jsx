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

const REQUIRED_PROFILE_FIELDS = [
  "userType",
  "display_name",
  "homeLocation",
  "phone",
];

/* =========================================
   AUTH HEADERS
========================================= */

async function getAuthHeaders(extraHeaders = {}) {

  const session =
    await fetchAuthSession();

  const token =
  session.tokens?.idToken?.toString();

  return {

    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,

    ...extraHeaders,
  };
}

/* =========================================
   HELPERS
========================================= */

function getValue(obj, path) {

  return path
    .split(".")
    .reduce(
      (acc, key) => acc?.[key],
      obj
    );
}

function calculateCompletion(profile) {

  if (!profile) return 0;

  const completed =
    REQUIRED_PROFILE_FIELDS
      .filter((field) => {

        const value =
          getValue(profile, field);

        if (
          field === "homeLocation"
        ) {

          return Boolean(
            value?.lat &&
            value?.lng
          );
        }

        return Boolean(
          String(value || "")
            .trim()
        );
      }).length;

  return Math.round(
    (
      completed /
      REQUIRED_PROFILE_FIELDS.length
    ) * 100
  );
}

function isNotFoundError(err) {

  const status =
    err?.response?.status ||
    err?.status;

  const data =
    err?.response?.data;

  return (
    status === 404 ||

    data?.error ===
      "Profile not found" ||

    data?.profile === null
  );
}

/* =========================================
   PROVIDER NORMALISER
========================================= */

function normaliseProviders(
  providers = {}
) {

  const result = {};

  if (
    providers?.facebook &&
    typeof providers.facebook === "object"
  ) {
    result.facebook =
      providers.facebook;
  }

  if (
    providers?.instagram &&
    typeof providers.instagram === "object"
  ) {
    result.instagram =
      providers.instagram;
  }

  if (
    providers?.youtube &&
    typeof providers.youtube === "object"
  ) {
    result.youtube =
      providers.youtube;
  }

  if (
    providers?.x &&
    typeof providers.x === "object"
  ) {
    result.x =
      providers.x;
  }

  return result;
}
/* =========================================
   PROVIDER
========================================= */

export function ProfileProvider({
  children,
}) {

  const api = useAPI();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  const apiRef =
    useRef(api);

  const hasLoadedRef =
    useRef(false);

  const loadingRef =
    useRef(false);

  /* =========================================
     STATE
  ========================================= */

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    providers,
    setProviders,
  ] = useState(
    normaliseProviders()
  );

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    profileSaving,
    setProfileSaving,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState(null);

  const [
    profileMissing,
    setProfileMissing,
  ] = useState(false);

  /* =========================================
     API REF
  ========================================= */

  useEffect(() => {

    apiRef.current = api;

  }, [api]);

  /* =========================================
     READY HELPER
  ========================================= */

  const markProfileReady =
    useCallback(

      (
        nextProfile = null,
        nextProviders = {},
        missing = false
      ) => {

        setProfile(nextProfile);

        setProviders(
          normaliseProviders(
            nextProviders
          )
        );

        setProfileMissing(
          missing
        );

        setProfileError(null);

        hasLoadedRef.current =
          true;
      },

      []
    );

  /* =========================================
     LOAD PROFILE
  ========================================= */

  const loadProfile =
    useCallback(
      async () => {

        if (
          loadingRef.current
        ) {

          return profile;
        }

        /* =========================
           NOT AUTHENTICATED
        ========================= */

        if (
          !isAuthenticated ||

          !user?.id
        ) {

          loadingRef.current =
            false;

          setProfile(null);

          setProviders(
            normaliseProviders()
          );

          setProfileMissing(
            false
          );

          setProfileError(
            null
          );

          setProfileLoading(
            false
          );

          hasLoadedRef.current =
            true;

          return null;
        }

        /* =========================
           START LOADING
        ========================= */

        loadingRef.current =
          true;

        setProfileLoading(
          true
        );

        setProfileError(null);

        try {

          const headers =
            await getAuthHeaders();

          console.log(
            "GET /me headers ready"
          );

          /* =========================
             HYDRATE FROM /me
          ========================= */

          const res =
            await apiRef.current.get(
              "/me",
              {
                headers,
              }
            );

          console.log(
            "GET /me response:",
            res
          );

const nextProfile = res?.profile || null;

const nextProviders =
  res?.providers || {};

try {
  localStorage.setItem(
    "communityone_profile_cache",
    JSON.stringify({
      profile: nextProfile,
      providers: nextProviders,
      cachedAt: Date.now(),
    })
  );
} catch {
  // ignore cache failure
}

markProfileReady(
  nextProfile,
  nextProviders,
  !nextProfile
);

          return nextProfile;

        } catch (err) {

          if (
            isNotFoundError(err)
          ) {

            console.warn(
              "Profile not found."
            );

            markProfileReady(
              null,
              {},
              true
            );

            return null;
          }

          console.error(
            "Profile load failed:",
            err
          );

          setProfile(null);

          setProviders(
            normaliseProviders()
          );

          setProfileMissing(
            false
          );

          setProfileError(
            err?.message ||
            "Profile load failed"
          );

          hasLoadedRef.current =
            true;

          return null;

        } finally {

          loadingRef.current =
            false;

          setProfileLoading(
            false
          );
        }
      },

      [
        isAuthenticated,
        user?.id,
        markProfileReady,
      ]
    );

  /* =========================================
     RESET ON AUTH CHANGE
  ========================================= */

  useEffect(() => {

    hasLoadedRef.current =
      false;

    loadingRef.current =
      false;

    setProfile(null);

    setProviders(
      normaliseProviders()
    );

    setProfileMissing(false);

    setProfileError(null);

    setProfileLoading(
      Boolean(
        isAuthenticated &&
        user?.id
      )
    );

  }, [
    isAuthenticated,
    user?.id,
  ]);

  /* =========================================
     INITIAL HYDRATION
  ========================================= */

  useEffect(() => {

    if (
      hasLoadedRef.current
    ) {
      return;
    }

    loadProfile();

  }, [loadProfile]);

  /* =========================================
     SAVE PROFILE
  ========================================= */

  const saveProfile =
    useCallback(
      async (
        nextProfile
      ) => {

        if (
          !isAuthenticated ||
          !user?.id
        ) {

          throw new Error(
            "User is not authenticated"
          );
        }

        setProfileSaving(
          true
        );

        setProfileError(
          null
        );

        const previousProfile =
          profile;

        
        try {

          const headers =
            await getAuthHeaders({

              "x-version":
                previousProfile
                  ?.version
                  ? String(
                      previousProfile.version
                    )
                  : "",
            });

          console.log(
  "PUT /profile payload:",
  nextProfile
);

const res =
  await apiRef.current.put(
    "/profile",
    nextProfile,
    { headers }
  );

const savedProfile =
  res?.profile;

setProfile(savedProfile);

if (res?.providers) {

  setProviders(
    normaliseProviders(
      res.providers
    )
  );
}

setProfileMissing(false);

hasLoadedRef.current = true;

return savedProfile;

        } catch (err) {

          const status =
            err?.response
              ?.status ||
            err?.status;

          if (
            status === 409
          ) {

            const serverProfile =
              err?.response
                ?.data
                ?.serverProfile;

            if (
              serverProfile
            ) {

              setProfile(
                serverProfile
              );

              setProfileMissing(
                false
              );

              hasLoadedRef.current =
                true;

              return serverProfile;
            }
          }

          console.error(
            "Profile save failed:",
            err
          );

          

          setProfileError(
            err?.message ||
            "Profile save failed"
          );

          throw err;

        } finally {

          setProfileSaving(
            false
          );
        }
      },

      [
        isAuthenticated,
        user?.id,
        profile?.version,
      ]
    );

  /* =========================================
     PATCH PROFILE
  ========================================= */

  const patchProfile =
  useCallback(
    async (patch) => {

      if (
        !isAuthenticated ||
        !user?.id
      ) {
        throw new Error(
          "User is not authenticated"
        );
      }

      setProfileSaving(true);
      setProfileError(null);

      try {

        const headers =
          await getAuthHeaders({

            "x-version":
              profile?.version
                ? String(profile.version)
                : "",
          });

        const res =
          await apiRef.current.patch(
            "/profile",
            patch,
            { headers }
          );

        const savedProfile =
          res?.profile;

        setProfile(savedProfile);

        if (res?.providers) {

          setProviders(
            normaliseProviders(
              res.providers
            )
          );
        }

        setProfileMissing(false);

        hasLoadedRef.current =
          true;

        return savedProfile;

      } catch (err) {

        console.error(
          "Profile patch failed:",
          err
        );

        setProfileError(
          err?.message ||
          "Profile patch failed"
        );

        throw err;

      } finally {

        setProfileSaving(false);
      }
    },

    [
      isAuthenticated,
      user?.id,
      profile?.version,
    ]
  );
  /* =========================================
     COMPLETION
  ========================================= */

  const completionPercent =
    useMemo(
      () =>
        calculateCompletion(
          profile
        ),
      [profile]
    );

  const profileReady =
    !profileLoading;

  const hasProfile =
    Boolean(profile);

  const isProfileComplete =
    hasProfile &&
    completionPercent >= 80;

  /* =========================================
     CONTEXT VALUE
  ========================================= */

  const value =
    useMemo(
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

    <ProfileContext.Provider
      value={value}
    >

      {children}

    </ProfileContext.Provider>
  );
}

/* =========================================
   HOOK
========================================= */

export function useProfile() {

  const context =
    useContext(
      ProfileContext
    );

  if (!context) {

    throw new Error(
      "useProfile must be used within ProfileProvider"
    );
  }

  return context;
}