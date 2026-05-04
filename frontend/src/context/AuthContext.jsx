import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setTokens(null);
  }, []);

  const refreshAuth = useCallback(async ({ forceRefresh = false } = {}) => {
    setHydrating(true);

    try {
      const amplifyUser = await getCurrentUser();

      const session = await fetchAuthSession({ forceRefresh });
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        clearAuth();
        return null;
      }

      const normalisedUser = normaliseUser(amplifyUser, session.tokens);

      setUser(normalisedUser);
      setToken(accessToken);
      setTokens(session.tokens);

      return normalisedUser;
    } catch (err) {
      console.error("❌ Auth refresh failed:", err);
      clearAuth();
      return null;
    } finally {
      setHydrating(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const currentUser = await refreshAuth();

        if (!mounted) return;

        if (currentUser) {
          console.log("✅ Auth restored:", currentUser.displayName);
        }
      } catch (err) {
        console.error("❌ Auth init failed:", err);

        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [refreshAuth, clearAuth]);

  const login = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } finally {
      clearAuth();
      window.location.replace("/");
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