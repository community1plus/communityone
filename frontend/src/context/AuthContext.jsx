import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from "aws-amplify/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     🔥 AUTH INITIALISATION (ROBUST)
  =============================== */
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        console.log("🔄 Initialising auth...");
        console.log("🌐 URL:", window.location.href);

        // 🔍 Detect OAuth redirect
        const isRedirectFlow =
          window.location.search.includes("code=") &&
          window.location.search.includes("state=");

        if (isRedirectFlow) {
          console.log("🔁 OAuth redirect detected");

          // 🔥 Give Amplify time to process redirect
          await new Promise((res) => setTimeout(res, 300));
        }

        // 🔥 FIRST ATTEMPT
        let session = await fetchAuthSession();

        // 🔁 RETRY ON EMPTY TOKENS (CRITICAL)
        if (!session.tokens?.accessToken) {
          console.log("⚠️ No tokens, retrying...");

          await new Promise((res) => setTimeout(res, 500));
          session = await fetchAuthSession();
        }

        if (!mounted) return;

        if (session.tokens?.accessToken) {
          const currentUser = await getCurrentUser();

          if (!mounted) return;

          setUser(currentUser);
          setTokens(session.tokens);

          console.log("✅ Auth restored", {
            hasAccessToken: true,
          });

          // 🔥 CLEAN URL (remove ?code=)
          if (isRedirectFlow) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        } else {
          console.log("🚫 No valid session");
        }
      } catch (err) {
        console.error("❌ Auth init failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===============================
     🔐 LOGIN
  =============================== */
  const login = async () => {
    console.log("🚀 Redirect login");
    await signInWithRedirect();
  };

  /* ===============================
     🔓 LOGOUT
  =============================== */
  const logout = async () => {
    await signOut({ global: true });

    setUser(null);
    setTokens(null);

    window.location.href = "/"; // 🔥 hard reset
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        isAuthenticated: !!tokens?.accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);