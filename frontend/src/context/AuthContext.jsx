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
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  /* ===============================
     LOAD USER FROM SESSION
  =============================== */
  const loadUser = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      const session = await fetchAuthSession();
      const idToken = session?.tokens?.idToken;
      const accessToken = session?.tokens?.accessToken;

      if (!idToken || !accessToken) {
        console.log("⚠️ No active session");
        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }
        return;
      }

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
        tokenUse: idPayload.token_use || null,
      };

      console.log("✅ User loaded:", normalizedUser);

      if (mountedRef.current) {
        setUser(normalizedUser);
      }
    } catch (err) {
      console.log("⚠️ Auth error:", err);
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

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    mountedRef.current = true;
    loadUser();

    return () => {
      mountedRef.current = false;
    };
  }, [loadUser]);

  /* ===============================
     AUTH EVENTS
  =============================== */
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      const event = payload?.event;
      console.log("🔔 Auth event:", event);

      if (event === "signedIn" || event === "tokenRefresh") {
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

    return () => {
      unsubscribe();
    };
  }, [loadUser]);

  /* ===============================
     LOGOUT
  =============================== */
  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    }
  }, []);

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}