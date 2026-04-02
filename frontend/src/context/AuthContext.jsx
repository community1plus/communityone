import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // 🔐 Auth user (Cognito)
  const [appUser, setAppUser] = useState(null); // 🔥 Backend user (DB)
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD AUTH USER
  =============================== */
  const loadUser = async () => {
    try {
      const session = await fetchAuthSession();

      // ⏳ Tokens not ready yet
      if (!session?.tokens) {
        console.log("⏳ No tokens yet, waiting...");
        return;
      }

      const currentUser = await getCurrentUser();
      console.log("✅ Auth user loaded:", currentUser);

      setUser(currentUser);

    } catch (err) {
      console.log("⚠️ No authenticated user");
      setUser(null);
      setAppUser(null); // 🔥 reset backend user too
    } finally {
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
     AUTH EVENTS (OAUTH / LOGIN)
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
        setAppUser(null); // 🔥 important reset
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
        user,        // 🔐 Cognito user
        appUser,     // 🔥 Backend user (USE THIS IN UI)
        setAppUser,  // 🔥 Set from AuthGate
        loading,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);