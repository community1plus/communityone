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

/* =========================================================
   NORMALISE USER
========================================================= */

function normaliseUser(
  amplifyUser,
  tokens
) {
  if (!amplifyUser) return null;

  const idPayload =
    tokens?.idToken?.payload || {};

  const email =
    idPayload.email ||
    amplifyUser.signInDetails
      ?.loginId ||
    "";

  const name =
    idPayload.name || "";

  const username =
    amplifyUser.username ||
    email ||
    "";

  const fallback =
    email?.split("@")[0] ||
    username ||
    "User";

  const displayName =
    name || fallback;

  const initials =
    displayName
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

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({
  children,
}) {
  const mountedRef =
    useRef(false);

  /* ======================================================
     USER STATE
  ====================================================== */

  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(null);

  const [tokens, setTokens] =
    useState(null);

  /* ======================================================
     GUEST STATE
  ====================================================== */

  const [isGuest, setIsGuest] =
    useState(() => {
      return (
        localStorage.getItem(
          "community_guest"
        ) === "true"
      );
    });

  /* ======================================================
     LOADING
  ====================================================== */

  const [loading, setLoading] =
    useState(true);

  const [
    hydrating,
    setHydrating,
  ] = useState(false);

  /* ======================================================
     CLEAR AUTH
  ====================================================== */

  const clearAuth =
    useCallback(() => {
      if (!mountedRef.current)
        return;

      setUser(null);

      setToken(null);

      setTokens(null);
    }, []);

  /* ======================================================
     REFRESH AUTH
  ====================================================== */

  const refreshAuth =
    useCallback(
      async ({
        forceRefresh = false,
      } = {}) => {
        if (mountedRef.current) {
          setHydrating(true);
        }

        try {
          let amplifyUser;

          try {
            amplifyUser =
              await getCurrentUser();
          } catch {
            clearAuth();

            return null;
          }

          const session =
            await fetchAuthSession({
              forceRefresh,
            });

          const accessToken =
            session.tokens?.accessToken?.toString();

          if (!accessToken) {
            clearAuth();

            return null;
          }

          const normalisedUser =
            normaliseUser(
              amplifyUser,
              session.tokens
            );

          if (
            !mountedRef.current
          ) {
            return normalisedUser;
          }

          /* ============================================
             AUTH USER RESTORED
          ============================================ */

          setUser(
            normalisedUser
          );

          setToken(
            accessToken
          );

          setTokens(
            session.tokens
          );

          /* ============================================
             REMOVE GUEST MODE
          ============================================ */

          localStorage.removeItem(
            "community_guest"
          );

          setIsGuest(false);

          return normalisedUser;
        } catch (err) {
          if (
            err?.name !==
            "UserUnAuthenticatedException"
          ) {
            console.warn(
              "Auth refresh skipped:",
              err?.name ||
                err?.message ||
                err
            );
          }

          clearAuth();

          return null;
        } finally {
          if (
            mountedRef.current
          ) {
            setHydrating(false);
          }
        }
      },
      [clearAuth]
    );

  /* ======================================================
     INIT
  ====================================================== */

  useEffect(() => {
    mountedRef.current = true;

    async function initAuth() {
      try {
        const currentUser =
          await refreshAuth();

        if (currentUser) {
          console.log(
            "✅ Auth restored:",
            currentUser.displayName
          );
        } else if (isGuest) {
          console.log(
            "👀 Guest session restored"
          );
        }
      } finally {
        if (
          mountedRef.current
        ) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mountedRef.current =
        false;
    };
  }, [
    refreshAuth,
    isGuest,
  ]);

  /* ======================================================
     LOGIN
  ====================================================== */

  const login =
    useCallback(async () => {
      localStorage.removeItem(
        "community_guest"
      );

      setIsGuest(false);

      await signInWithRedirect();
    }, []);

  /* ======================================================
     CONTINUE AS GUEST
  ====================================================== */

const continueAsGuest = useCallback(async () => {
  console.log("👀 Guest mode enabled");

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

  localStorage.setItem("community_guest", "true");
  setIsGuest(true);
}, [clearAuth]);

  /* ======================================================
     LOGOUT
  ====================================================== */

  const logout =
    useCallback(async () => {
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
        /* ============================================
           CLEAR AUTH
        ============================================ */

        clearAuth();

        /* ============================================
           CLEAR GUEST
        ============================================ */

        localStorage.removeItem(
          "community_guest"
        );

        setIsGuest(false);

        /* ============================================
           REDIRECT
        ============================================ */

        window.location.assign(
          "/"
        );
      }
    }, [clearAuth]);

  /* ======================================================
     AUTH STATE
  ====================================================== */

  const isAuthenticated =
    Boolean(user && token);

  /* ======================================================
     ROLE
  ====================================================== */

  const role =
    isAuthenticated
      ? "member"
      : isGuest
      ? "guest"
      : "anonymous";

  /* ======================================================
     CONTEXT VALUE
  ====================================================== */

  const value = useMemo(
    () => ({
      /* ============================================
         USER
      ============================================ */

      user,
      token,
      tokens,

      /* ============================================
         FLAGS
      ============================================ */

      loading,
      hydrating,

      isAuthenticated,
      isGuest,

      role,

      /* ============================================
         ACTIONS
      ============================================ */

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

      loading,
      hydrating,

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

  /* ======================================================
     PROVIDER
  ====================================================== */

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}