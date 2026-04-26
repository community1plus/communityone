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

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);

  /* =========================
     LOAD USER (🔥 CLEAN)
  ========================= */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const session = await fetchAuthSession();
      const tokens = session?.tokens;

      console.log("SESSION:", session);
      console.log("TOKENS:", tokens);

      /* =========================
         🔥 NO TOKENS → WAIT (NO RETRY)
      ========================= */

      if (!tokens?.idToken || !tokens?.accessToken) {
        console.log("⚠️ No tokens yet (waiting for signedIn)");

        if (mountedRef.current) {
          setLoading(false); // 🔥 prevent infinite loading
        }

        return;
      }

      /* =========================
         NORMALISE USER
      ========================= */

      const idPayload = tokens.idToken.payload || {};
      const accessPayload = tokens.accessToken.payload || {};

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
         BACKEND USER
      ========================= */

      try {
        const res = await fetch(
          "https://communityone-backend.onrender.com/api/users/me",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.idToken.toString()}`,
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

        if (mountedRef.current) {
          setAppUser({
            user: null,
            hasProfile: false,
            profile: null,
          });
        }
      }

    } catch (err) {
      console.error("❌ Auth error:", err);

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
      }

    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    mountedRef.current = true;
    loadUser();

    return () => {
      mountedRef.current = false;
    };
  }, [loadUser]);

  /* =========================
     AUTH EVENTS (🔥 CORE FIX)
  ========================= */

  useEffect(() => {
    const unsub = Hub.listen("auth", ({ payload }) => {
      const event = payload?.event;

      console.log("🔔 Auth event:", event);

      if (event === "signedIn") {
        setLoading(true);   // 🔥 trigger re-load
        loadUser();         // 🔥 tokens now available
      }

      if (event === "tokenRefresh") {
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

    return () => unsub();
  }, [loadUser]);

  /* =========================
     LOGOUT (SOFT)
  ========================= */

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    }
  }, []);

  /* =========================
     CONTEXT VALUE
  ========================= */

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

/* =========================
   HOOK
========================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}