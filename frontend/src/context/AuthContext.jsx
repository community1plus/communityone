import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  fetchAuthSession,
  fetchUserAttributes,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadingRef = useRef(false); // 🔥 prevents duplicate loads

  /* ===============================
     LOAD USER (STABLE)
  =============================== */
  const loadUser = async () => {
    // 🔥 prevent double execution
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const session = await fetchAuthSession();

      if (!session?.tokens?.idToken) {
        console.log("⚠️ No active session");
        setUser(null);
        setAppUser(null);
        return;
      }

      const attributes = await fetchUserAttributes();

      console.log("✅ User loaded:", attributes);

      setUser({
        ...attributes,
        authenticated: true,
      });

    } catch (err) {
      console.log("⚠️ Auth error:", err);
      setUser(null);
      setAppUser(null);
    } finally {
      setLoading(false);          // 🔥 ALWAYS resolves UI
      loadingRef.current = false; // 🔥 release lock
    }
  };

  /* ===============================
     INITIAL LOAD (ONCE ONLY)
  =============================== */
  useEffect(() => {
    loadUser();
  }, []);

  /* ===============================
     AUTH EVENTS (FIXED)
  =============================== */
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      console.log("🔔 Auth event:", payload.event);

      if (payload.event === "signedIn") {
        // ❌ DO NOT set loading true again
        loadUser(); // just refresh user
      }

      if (payload.event === "signedOut") {
        setUser(null);
        setAppUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /* ===============================
     LOGOUT
  =============================== */
  const logout = async () => {
    await signOut();
    setUser(null);
    setAppUser(null);
  };

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

export const useAuth = () => useContext(AuthContext);