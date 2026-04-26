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
   STORAGE
========================= */

const STORAGE_KEY = "auth_cache_v1";

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }) {
  /* =========================
     STATE
  ========================= */

  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  /* =========================
     🔥 LOAD CACHE (INSTANT UI)
  ========================= */

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        console.log("⚡ CACHE HIT");

        setUser(parsed.user || null);
        setAppUser(parsed.appUser ?? null);

        // 🔥 allow UI immediately
        setLoading(false);
      }
    } catch (err) {
      console.warn("Cache parse failed");
    }
  }, []);

  /* =========================
     🔥 SAVE CACHE
  ========================= */

  const persistCache = useCallback((userData, appUserData) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: userData,
          appUser: appUserData,
          ts: Date.now(),
        })
      );
    } catch {}
  }, []);

  /* =========================
     LOAD USER (REAL SOURCE)
  ========================= */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current || loadingRef.current) return;

    loadingRef.current = true;

    try {
      let session;

      try {
        session = await fetchAuthSession();
      } catch {
        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }
        return;
      }

      const tokens = session?.tokens;

      if (!tokens?.idToken || !tokens?.accessToken) {
        console.log("⚠️ Tokens not ready");
        return;
      }

      const idPayload = tokens.idToken.payload || {};
      const accessPayload = tokens.accessToken.payload || {};

      const normalizedUser = {
        authenticated: true,
        sub: idPayload.sub || null,
        email: idPayload.email || null,
        username:
          accessPayload.username ||
          idPayload["cognito:username"] ||
          null,
        name: idPayload.name || null,
        token: tokens.idToken.toString(),
      };

      if (mountedRef.current) {
        setUser(normalizedUser);
      }

      /* =========================
         BACKEND SYNC
      ========================= */

      let appUserData = null;

      try {
        const res = await fetch(
          "https://communityone-backend.onrender.com/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${normalizedUser.token}`,
            },
          }
        );

        const data = await res.json();

        appUserData = {
          user: data?.user || null,
          hasProfile: data?.hasProfile ?? false,
          profile: data?.profile || null,
        };

        if (mountedRef.current) {
          setAppUser(appUserData);
        }

      } catch (err) {
        console.error("Backend sync failed");

        if (mountedRef.current) {
          setAppUser({
            user: null,
            hasProfile: false,
            profile: null,
          });
        }
      }

      /* =========================
         🔥 SAVE CACHE
      ========================= */

      persistCache(normalizedUser, appUserData);

    } catch (err) {
      console.error("Auth error:", err);

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
  }, [persistCache]);

  /* =========================
     INITIAL LOAD (BACKGROUND)
  ========================= */

  useEffect(() => {
    mountedRef.current = true;

    // 🔥 delay avoids blocking first paint
    setTimeout(loadUser, 50);

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

      if (event === "signedIn") {
        setAppUser(undefined);
        loadUser();
      }

      if (event === "tokenRefresh") {
        loadUser();
      }

      if (event === "signedOut") {
        localStorage.removeItem(STORAGE_KEY);

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
     LOGOUT
  ========================= */

  const logout = useCallback(async () => {
    try {
      await signOut({ global: true });
    } finally {
      localStorage.removeItem(STORAGE_KEY);

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    }
  }, []);

  /* =========================
     CONTEXT
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
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}