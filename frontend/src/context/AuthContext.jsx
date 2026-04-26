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

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  /* =========================
     LOAD USER (🔥 HARDENED)
  ========================= */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current || loadingRef.current) return;

    loadingRef.current = true;

    try {
      /* =========================
         HYDRATION DELAY
      ========================= */
      await new Promise((r) => setTimeout(r, 100));

      let session;

      /* =========================
         SAFE SESSION FETCH
      ========================= */

      try {
        const session = await fetchAuthSession();
        console.log("SESSION:", session);
        console.log("TOKENS:", session?.tokens);
      } catch {
        console.log("⚠️ No active session");

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }
        return;
      }

      let tokens = session?.tokens;

      /* =========================
         TOKEN RETRY (🔥 KEY FIX)
      ========================= */

      if (!tokens?.idToken || !tokens?.accessToken) {
        console.log("⚠️ Missing tokens → retry");

        await new Promise((r) => setTimeout(r, 400));

        try {
          const retrySession = await fetchAuthSession();
          tokens = retrySession?.tokens;

          if (!tokens?.idToken || !tokens?.accessToken) {
            console.log("❌ Tokens still missing");

            if (mountedRef.current) {
              setUser(null);
              setAppUser(null);
            }
            return;
          }

          session = retrySession;

        } catch {
          console.log("❌ Retry failed");

          if (mountedRef.current) {
            setUser(null);
            setAppUser(null);
          }
          return;
        }
      }

      /* =========================
         NORMALISE USER
      ========================= */

      const idToken = tokens.idToken;
      const accessToken = tokens.accessToken;

      const idPayload = idToken.payload || {};
      const accessPayload = accessToken.payload || {};

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
     AUTH EVENTS
  ========================= */

  useEffect(() => {
    const unsub = Hub.listen("auth", ({ payload }) => {
      const event = payload?.event;

      console.log("🔔 Auth event:", event);

      if (event === "signedIn" || event === "tokenRefresh") {
        setLoading(true);
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
     SOFT LOGOUT (🔥 FINAL)
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
   HOOK (🔥 REQUIRED EXPORT)
========================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}