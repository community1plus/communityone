import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     LOAD USER (ROBUST VERSION)
  =============================== */
  const loadUser = async () => {
    try {
      // 🔥 Force session resolution
      const session = await fetchAuthSession();

      // 🔥 If no tokens yet → still loading
      if (!session?.tokens) {
        console.log("⏳ No tokens yet, waiting...");
        return;
      }

      const currentUser = await getCurrentUser();
      console.log("✅ User loaded:", currentUser);

      setUser(currentUser);

    } catch (err) {
      console.log("⚠️ No authenticated user");
      setUser(null);
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
     LISTEN FOR OAUTH EVENTS
  =============================== */
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      console.log("🔔 Auth event:", payload.event);

      if (payload.event === "signedIn") {
        setLoading(true); // 🔥 important
        loadUser();
      }

      if (payload.event === "signedOut") {
        setUser(null);
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
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);