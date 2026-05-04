import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

const AuthContext = createContext(null);

function normaliseUser(amplifyUser) {
  if (!amplifyUser) return null;

  const username = amplifyUser.username || "";
  const fallback = username.split("@")[0] || "User";

  const displayName = fallback;

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
    email: username.includes("@") ? username : null,
    name: null,
    displayName,
    initials,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  const refreshAuth = useCallback(async () => {
    setHydrating(true);

    try {
      const amplifyUser = await getCurrentUser();
      const normalisedUser = normaliseUser(amplifyUser);

      setUser(normalisedUser);

      return normalisedUser;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setHydrating(false);
    }
  }, []);

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
          setUser(null);
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
  }, [refreshAuth]);

  const login = useCallback(async () => {
    await signInWithRedirect();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } finally {
      setUser(null);
      window.location.replace("/");
    }
  }, []);

  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      loading,
      hydrating,
      isAuthenticated,

      login,
      logout,
      refreshAuth,
    }),
    [user, loading, hydrating, isAuthenticated, login, logout, refreshAuth]
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