import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // Cognito user
  const [appUser, setAppUser] = useState(null);  // Backend user
  const [loading, setLoading] = useState(true);

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  /* =====================================================
     LOAD USER (🔥 HARDENED)
  ===================================================== */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current) return;
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      let session;

      /* =========================
         SAFE SESSION FETCH
      ========================= */

      try {
        session = await fetchAuthSession({ forceRefresh: true });
      } catch (err) {
        console.log("⚠️ No active session (expected)");

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }

        return;
      }

      const tokens = session?.tokens;

      if (!tokens?.idToken || !tokens?.accessToken) {
        console.log("⚠️ Missing tokens");

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }

        return;
      }

      const idToken = tokens.idToken;
      const accessToken = tokens.accessToken;

      const idPayload = idToken.payload || {};
      const accessPayload = accessToken.payload || {};

      /* =========================
         NORMALISE USER
      ========================= */

      const normalizedUser = {
        authenticated: true,
        sub: idPayload.sub || null,
        email: idPayload.email || null,
        email_verified: idPayload.email_verified || false,
        username:
          accessPayload.username ||
          idPayload["cognito:username"] ||
          idPayload.username ||
          null,
        name: idPayload.name || null,
      };

      if (mountedRef.current) {
        setUser(normalizedUser);
      }

      /* =========================
         FETCH BACKEND USER
      ========================= */

      try {
        const res = await fetch(
          "https://communityone-backend.onrender.com/api/users/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken.toString()}`,
            },
          }
        );

        const data = await res.json();

        if (mountedRef.current) {
          setAppUser({
            user: data?.user || null,
            hasProfile: data?.hasProfile || false,
            profile: data?.profile || null,
          });
        }

      } catch (err) {
        console.error("❌ Backend fetch failed:", err);

        /* 🔥 DO NOT BREAK AUTH */
        if (mountedRef.current) {
          setAppUser({
            user: null,
            hasProfile: false,
            profile: null,
          });
        }
      }

    } catch (err) {
      console.error("❌ Auth fatal error:", err);

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
      }

    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }

      loadingRef.current = false;
    }
  }, []);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    mountedRef.current = true;
    loadUser();

    return () => {
      mountedRef.current = false;
    };
  }, [loadUser]);

  /* =====================================================
     AUTH EVENTS (🔥 STABLE)
  ===================================================== */

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      const event = payload?.event;

      console.log("🔔 Auth event:", event);

      if (event === "signedIn" || event === "tokenRefresh") {
        setLoading(true); // 🔥 important
        loadUser();
      }

      if (event === "signedOut") {
        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [loadUser]);

  /* =====================================================
     LOGOUT (🔥 HARD RESET)
  ===================================================== */

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      /* 🔥 guarantee clean state */
      window.location.href = "/";
    }
  }, []);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        setAppUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}