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

  const idToken = tokens?.idToken?.payload || {};

  const email = idToken.email || null;
  const name = idToken.name || null;

  const fallback = email?.split("@")[0] || amplifyUser.username || "User";
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
    username: amplifyUser.username,
    email,
    name,
    displayName,
    initials,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  const refreshAuth = useCallback(async ({ forceRefresh = false } = {}) => {
    setHydrating(true);

    try {
      const session = await fetchAuthSession({ forceRefresh });

      if (!session.tokens?.accessToken) {
        setUser(null);
        setTokens(null);
        return null;
      }

      const amplifyUser = await getCurrentUser();
      const enrichedUser = normaliseUser(amplifyUser, session.tokens);

      setUser(enrichedUser);
      setTokens(session.tokens);

      return enrichedUser;
    } catch (err) {
      console.error("❌ Auth refresh failed:", err);

      setUser(null);
      setTokens(null);

      return null;
    } finally {
      setHydrating(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("🔄 Initialising auth...");

        const isRedirect =
          window.location.search.includes("code=") &&
          window.location.search.includes("state=");

        if (isRedirect) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (!mounted) return;

        const refreshedUser = await refreshAuth();

        if (!mounted) return;

        if (refreshedUser) {
          console.log("✅ Auth restored", {
            user: refreshedUser.displayName,
          });
        }

        if (isRedirect) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (err) {
        console.error("❌ Auth init failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [refreshAuth]);

  const login = useCallback(async () => {
    if (tokens?.accessToken) {
      console.log("⚠️ Already authenticated — skipping login");
      return;
    }

    console.log("🚀 Redirect login");
    await signInWithRedirect();
  }, [tokens]);

  const logout = useCallback(async () => {
    await signOut({ global: true });

    setUser(null);
    setTokens(null);

    window.location.href = "/";
  }, []);

  const isAuthenticated = Boolean(tokens?.accessToken);

  const value = useMemo(
    () => ({
      user,
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

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};