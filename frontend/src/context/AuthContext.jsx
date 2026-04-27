import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

/* =========================
   STORAGE
========================= */

const STORAGE_KEY = "auth_cache_v8";

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 🔥 backend user state
  const [appUser, setAppUser] = useState(null);
  const [appUserStatus, setAppUserStatus] = useState("loading"); 
  // "loading" | "ready" | "error"

  const [token, setToken] = useState(null);

  // 🔥 auth lifecycle
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  /* =========================
     CACHE HYDRATION (FAST START)
  ========================= */

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        setUser(parsed.user || null);
        setAppUser(parsed.appUser ?? null);
        setToken(parsed.token || null);

        // cache is usable but not authoritative
        setAppUserStatus("ready");
      }
    } catch {
      console.warn("Cache parse failed");
    }
  }, []);

  /* =========================
     CACHE SAVE
  ========================= */

  const persistCache = useCallback((userData, appUserData, token) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: userData,
          appUser: appUserData,
          token,
          ts: Date.now(),
        })
      );
    } catch {}
  }, []);

  /* =========================
     LOAD USER (SOURCE OF TRUTH)
  ========================= */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current || loadingRef.current) return;

    loadingRef.current = true;

    try {
      const session = await fetchAuthSession();
      const tokens = session?.tokens;

      /* =========================
         NO SESSION
      ========================= */

      if (!tokens?.accessToken) {
        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
          setAppUserStatus("ready");
          setToken(null);
        }
        return;
      }

      const accessToken = tokens.accessToken.toString();
      const payload = tokens.idToken?.payload || {};

      const normalizedUser = {
        authenticated: true,
        sub: payload.sub || null,
        email: payload.email || null,
        username: payload["cognito:username"] || null,
        name: payload.name || null,
      };

      if (mountedRef.current) {
        setUser(normalizedUser);
        setToken(accessToken);

        // 🔥 backend fetch starting
        setAppUserStatus("loading");
      }

      /* =========================
         BACKEND SYNC (/me)
      ========================= */

      let appUserData = null;

      try {
        const res = await fetch(
          "https://communityone-backend.onrender.com/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        /* 🔴 UNAUTHORIZED (MOST IMPORTANT CASE) */
        if (res.status === 401) {
          console.warn("⚠️ /me unauthorized");

          if (mountedRef.current) {
            setAppUser(null);
            setAppUserStatus("error"); // 🔥 prevents flicker
          }

          return;
        }

        const data = await res.json();

        appUserData = {
          user: data?.user || null,
          hasProfile: data?.hasProfile ?? false,
          profile: data?.profile || null,
        };

        if (mountedRef.current) {
          setAppUser(appUserData);
          setAppUserStatus("ready");
        }

      } catch (err) {
        console.error("Backend sync failed:", err);

        if (mountedRef.current) {
          setAppUser(null);
          setAppUserStatus("error"); // 🔥 graceful fallback
        }
      }

      persistCache(normalizedUser, appUserData, accessToken);

    } catch (err) {
      console.error("Auth error:", err);

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
        setAppUserStatus("ready");
        setToken(null);
      }

    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setInitialized(true);
      }

      loadingRef.current = false;
    }
  }, [persistCache]);

  /* =========================
     INIT
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
        loadUser();
      }

      if (event === "signedOut") {
        localStorage.removeItem(STORAGE_KEY);

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
          setAppUserStatus("ready");
          setToken(null);
          setLoading(false);
          setInitialized(true);
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
        setAppUserStatus("ready");
        setToken(null);
        setLoading(false);
        setInitialized(true);
      }
    }
  }, []);

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = useMemo(
    () => ({
      user,
      appUser,
      appUserStatus,
      setAppUser,
      token,
      loading,
      initialized,
      logout,
    }),
    [user, appUser, appUserStatus, token, loading, initialized, logout]
  );

  return (
    <AuthContext.Provider value={value}>
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