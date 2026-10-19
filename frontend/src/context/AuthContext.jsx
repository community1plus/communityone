import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

import { apiFetch } from "../services/api";

const AuthContext = createContext(null);

const GUEST_KEY = "community_guest";

/* =========================================
   NORMALISE USER
========================================= */

function normaliseUser(amplifyUser, tokens) {
  if (!amplifyUser) {
    return null;
  }

  const idPayload = tokens?.idToken?.payload || {};

  const email =
    idPayload.email ||
    amplifyUser.signInDetails?.loginId ||
    "";

  const name = idPayload.name || "";

  const username =
    amplifyUser.username ||
    email ||
    "";

  const fallback =
    email?.split("@")[0] ||
    username ||
    "User";

  const displayName = name || fallback;

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id:
      amplifyUser.userId ||
      idPayload.sub ||
      amplifyUser.username ||
      email,

    sub:
      idPayload.sub ||
      amplifyUser.userId ||
      null,

    username,
    email,
    name,
    displayName,
    initials,
    raw: amplifyUser,
  };
}

/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({ children }) {
  const mountedRef = useRef(true);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokens, setTokens] = useState(null);

  // Backend participation state from GET /api/me.
  const [participation, setParticipation] = useState(null);

  // True while participation is being loaded.
  const [participationLoading, setParticipationLoading] =
    useState(false);

  // Records whether the latest participation request failed.
  const [participationError, setParticipationError] =
    useState(null);

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem(GUEST_KEY) === "true";
  });

  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  /* =========================================
     MOUNT
  ========================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =========================================
     CLEAR AUTH
  ========================================= */

  const clearAuth = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setUser(null);
    setToken(null);
    setTokens(null);

    setParticipation(null);
    setParticipationLoading(false);
    setParticipationError(null);
  }, []);

  /* =========================================
     LOAD PARTICIPATION
  ========================================= */

  const loadParticipation = useCallback(
    async (accessToken) => {
      if (!accessToken) {
        if (mountedRef.current) {
          setParticipation(null);
          setParticipationError(
            "An access token is required to load participation."
          );
        }

        return null;
      }

      if (mountedRef.current) {
        setParticipationLoading(true);
        setParticipationError(null);
      }

      try {
        const response = await apiFetch("/me", {
          method: "GET",
          token: accessToken,
        });

        if (response?.authenticated !== true) {
          throw new Error(
            "The backend did not confirm authentication."
          );
        }

        const nextParticipation =
          response?.participation ?? null;

        if (mountedRef.current) {
          setParticipation(nextParticipation);
        }

        return nextParticipation;
      } catch (error) {
        console.error(
          "[AUTH] Participation hydration failed:",
          error?.message || error
        );

        if (mountedRef.current) {
          setParticipation(null);
          setParticipationError(
            error?.message ||
              "Unable to load participation."
          );
        }

        // Do not sign the user out just because
        // the participation endpoint is unavailable.
        return null;
      } finally {
        if (mountedRef.current) {
          setParticipationLoading(false);
        }
      }
    },
    []
  );

  /* =========================================
     REFRESH AUTH
  ========================================= */

  const refreshAuth = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (mountedRef.current) {
        setHydrating(true);
      }

      try {
        const amplifyUser = await getCurrentUser();

        const session = await fetchAuthSession({
          forceRefresh,
        });

        const accessToken =
          session.tokens?.idToken?.toString();

        const idPayload = session.tokens?.idToken?.payload || {};

console.log("[AUTH ID TOKEN CLAIMS]", {
  sub: idPayload.sub,
  email: idPayload.email,
  emailVerified: idPayload.email_verified,
  cognitoUsername: idPayload["cognito:username"],
  issuer: idPayload.iss,
});  

        if (!accessToken) {
          clearAuth();
          return null;
        }

        const normalisedUser = normaliseUser(
          amplifyUser,
          session.tokens
        );

        if (mountedRef.current) {
          setUser(normalisedUser);
          setToken(accessToken);
          setTokens(session.tokens);

          localStorage.removeItem(GUEST_KEY);
          setIsGuest(false);
        }

        /*
         * Load backend participation using the newly
         * obtained token. A participation failure does
         * not invalidate successful Amplify auth.
         */
        await loadParticipation(accessToken);

        /*
         * Preserve the existing return contract for
         * callers that need the refreshed token.
         */
        return {
          user: normalisedUser,
          token: accessToken,
        };
      } catch (err) {
        if (
          err?.name !== "UserUnAuthenticatedException" &&
          err?.name !== "NotAuthorizedException"
        ) {
          console.warn(
            "Auth refresh failed:",
            err?.name ||
              err?.message ||
              err
          );
        }

        clearAuth();
        return null;
      } finally {
        if (mountedRef.current) {
          setHydrating(false);
        }
      }
    },
    [clearAuth, loadParticipation]
  );

  /* =========================================
     INITIAL AUTH
  ========================================= */

  useEffect(() => {
    async function initAuth() {
      try {
        await refreshAuth();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    initAuth();
  }, [refreshAuth]);

  /* =========================================
     LOGIN
  ========================================= */

  const login = useCallback(async () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);

    await signInWithRedirect();
  }, []);

  /* =========================================
     GUEST MODE
  ========================================= */

  const continueAsGuest = useCallback(async () => {
    try {
      await signOut({
        global: false,
      });
    } catch (err) {
      console.warn(
        "Guest mode signOut warning:",
        err?.message || err
      );
    }

    clearAuth();

    localStorage.setItem(GUEST_KEY, "true");

    setIsGuest(true);
    setLoading(false);
    setHydrating(false);
  }, [clearAuth]);

  /* =========================================
     LOGOUT
  ========================================= */

  const logout = useCallback(async () => {
    try {
      await signOut({
        global: true,
      });
    } catch (err) {
      console.warn(
        "Logout warning:",
        err?.message || err
      );
    } finally {
      clearAuth();

      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);

      window.location.assign("/");
    }
  }, [clearAuth]);

  /* =========================================
     AUTH STATE
  ========================================= */

  const isAuthenticated = Boolean(user && token);

  const authLoading = loading || hydrating;

  const role = isAuthenticated
    ? "member"
    : isGuest
      ? "guest"
      : "anonymous";

  /* =========================================
     CONTEXT VALUE
  ========================================= */

  const value = useMemo(
    () => ({
      user,
      token,
      tokens,

      // Backend participation state.
      participation,
      participationLoading,
      participationError,
      loadParticipation,

      loading,
      hydrating,
      authLoading,

      isAuthenticated,
      isGuest,
      role,

      login,
      logout,
      continueAsGuest,
      refreshAuth,
      clearAuth,
    }),
    [
      user,
      token,
      tokens,
      participation,
      participationLoading,
      participationError,
      loadParticipation,
      loading,
      hydrating,
      authLoading,
      isAuthenticated,
      isGuest,
      role,
      login,
      logout,
      continueAsGuest,
      refreshAuth,
      clearAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================
   USE AUTH
========================================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
