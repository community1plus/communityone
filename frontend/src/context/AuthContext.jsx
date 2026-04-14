import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchAuthSession,
  fetchUserAttributes,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Cognito user
  const [appUser, setAppUser] = useState(null); // Backend user
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD AUTH USER (FIXED)
  =============================== */
  const loadUser = async () => {
    try {
      const session = await fetchAuthSession();

      // ✅ If no session → user is logged out (NOT loading)
      if (!session?.tokens?.idToken) {
        console.log("⚠️ No active session");
        setUser(null);
        setAppUser(null);
        return;
      }

      // ✅ Get attributes instead of getCurrentUser (more stable)
      const attributes = await fetchUserAttributes();

      console.log("✅ Auth user loaded:", attributes);

      setUser({
        ...attributes,
        authenticated: true
      });

    } catch (err) {
      console.log("⚠️ Auth load error:", err);
      setUser(null);
      setAppUser(null);
    } finally {
      // 🔥 CRITICAL — ALWAYS RUN
      setLoading(false);
    }
  };

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    loadUser();
  }, []);

  /* ===============================
     AUTH EVENTS
  =============================== */
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      console.log("🔔 Auth event:", payload.event);

      if (payload.event === "signedIn") {
        setLoading(true);
        loadUser();
      }

      if (payload.event === "signedOut") {
        setUser(null);
        setAppUser(null);
        setLoading(false); // 🔥 important
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);