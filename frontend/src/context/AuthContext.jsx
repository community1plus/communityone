import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

const AuthContext = createContext(null);

function normaliseUser(amplifyUser, tokens) {
  if (!amplifyUser) return null;

  const idPayload = tokens?.idToken?.payload || {};

  const email = idPayload.email || amplifyUser.signInDetails?.loginId || "";
  const name = idPayload.name || "";
  const username = amplifyUser.username || email || "";
  const fallback = email?.split("@")[0] || username || "User";
  const displayName = name || fallback;

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: amplifyUser.userId,
    username,
    email,
    name,
    displayName,
    initials,
  };
}

export function AuthProvider({ children }) {
  const mountedRef = useRef(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  const clearAuth = useCallback(() => {
    if (!mountedRef.current) return;

    setUser(null);
    setToken(null);
    setTokens(null);
  }, []);

  const refreshAuth = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (mountedRef.current) {
        setHydrating(true);
      }

      try {
        let amplifyUser;

        try {
          amplifyUser = await getCurrentUser();
        } catch {
          clearAuth();
          return null;
        }

        const session = await fetchAuthSession({ forceRefresh });
        const accessToken = session.tokens?.accessToken?.toString();

        if (!accessToken) {
          clearAuth();
          return null;
        }

        const normalisedUser = normaliseUser(amplifyUser, session.tokens);

        if (!mountedRef.current) {
          return normalisedUser;
        }

        setUser(normalisedUser);
        setToken(accessToken);
        setTokens(session.tokens);

        return normalisedUser;
      } catch (err) {
        if (err?.name !== "UserUnAuthenticatedException") {
          console.warn("Auth refresh skipped:", err?.name || err?.message || err);
        }

        clearAuth();
        return null;
      } finally {
        if (mountedRef.current) {
          setHydrating(false);
        }
      }
    },
    [clearAuth]
  );

  useEffect(() => {
    mountedRef.current = true;

    async function initAuth() {
      try {
        const currentUser = await refreshAuth();

        if (currentUser) {
          console.log("✅ Auth restored:", currentUser.displayName);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mountedRef.current = false;
    };
  }, [refreshAuth]);

  const login = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } catch (err) {
      console.warn("Logout warning:", err?.message || err);
    } finally {
      clearAuth();
      window.location.assign("/");
    }
  }, [clearAuth]);

  const isAuthenticated = Boolean(user && token);

  const value = useMemo(
    () => ({
      user,
      token,
      tokens,

      loading,
      hydrating,
      isAuthenticated,

      login,
      logout,
      refreshAuth,
      clearAuth,
    }),
    [
      user,
      token,
      tokens,
      loading,
      hydrating,
      isAuthenticated,
      login,
      logout,
      refreshAuth,
      clearAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}