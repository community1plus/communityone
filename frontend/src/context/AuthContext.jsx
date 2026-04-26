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

const STORAGE_KEY = "auth_cache_v3";

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(undefined);

  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  /* =========================
     TOKEN (🔥 NEW)
  ========================= */

  const [token, setToken] = useState(null);

  /* =========================
     CACHE LOAD
  ========================= */

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        setUser(parsed.user || null);
        setAppUser(parsed.appUser ?? null);
        setToken(parsed.token || null);

        setLoading(false);
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
     LOAD USER
  ========================= */

  const loadUser = useCallback(async () => {
    if (!mountedRef.current || loadingRef.current) return;

    loadingRef.current = true;

    try {
      const session = await fetchAuthSession();

      const tokens = session?.tokens;

      if (!tokens?.idToken) {
        return;
      }

      const idToken = tokens.idToken.toString();
      const payload = tokens.idToken.payload || {};

      const normalizedUser = {
        authenticated: true,
        sub: payload.sub || null,
        email: payload.email || null,
        username: payload["cognito:username"] || null,
        name: payload.name || null,
      };

      if (mountedRef.current) {
        setUser(normalizedUser);
        setToken(idToken);
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
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (res.status !== 401) {
          const data = await res.json();

          appUserData = {
            user: data?.user || null,
            hasProfile: data?.hasProfile ?? false,
            profile: data?.profile || null,
          };
        }

      } catch {
        console.warn("Backend sync failed");
      }

      if (mountedRef.current) {
        setAppUser(appUserData);
      }

      persistCache(normalizedUser, appUserData, idToken);

    } catch (err) {
      console.error("Auth error:", err);

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
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

      if (event === "signedIn" || event === "tokenRefresh") {
        loadUser();
      }

      if (event === "signedOut") {
        localStorage.removeItem(STORAGE_KEY);

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
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
        setToken(null);
        setLoading(false);
        setInitialized(true);
      }
    }
  }, []);

  /* =========================
     MEMO VALUE
  ========================= */

  const value = useMemo(
    () => ({
      user,
      appUser,
      setAppUser,
      token,          // 🔥 NEW
      loading,
      initialized,
      logout,
    }),
    [user, appUser, token, loading, initialized, logout]
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