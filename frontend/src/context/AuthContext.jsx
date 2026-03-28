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
     LOAD USER (INITIAL + REFRESH)
  =============================== */

  const loadUser = async () => {
    try {
      // ensures tokens are ready (important after OAuth redirect)
      await fetchAuthSession();

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
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
     LISTEN TO AUTH EVENTS (CRITICAL)
  =============================== */

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      const { event } = payload;

      if (event === "signedIn") {
        loadUser(); // 🔥 handles OAuth return
      }

      if (event === "signedOut") {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  /* ===============================
     LOGOUT
  =============================== */

  const logout = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ===============================
   HOOK
=============================== */

export const useAuth = () => useContext(AuthContext);