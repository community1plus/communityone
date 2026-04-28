import {
createContext,
useContext,
useEffect,
useState,
useCallback,
useMemo,
} from "react";

import {
fetchAuthSession,
getCurrentUser,
signInWithRedirect,
signOut,
} from "aws-amplify/auth";

/* ===============================
CONTEXT
=============================== */

const AuthContext = createContext();

/* ===============================
HELPERS
=============================== */

function normaliseUser(amplifyUser, tokens) {
if (!amplifyUser) return null;

const idToken = tokens?.idToken?.payload || {};

const email = idToken.email || null;
const name = idToken.name || null;

const fallback =
email?.split("@")[0] ||
amplifyUser.username ||
"User";

const displayName = name || fallback;

const initials = displayName
.split(/[\s._-]+/)
.map((p) => p[0])
.join("")
.slice(0, 2)
.toUpperCase();

return {
id: amplifyUser.userId,
username: amplifyUser.username,

email,
name,
displayName,

initials,

};
}

/* ===============================
PROVIDER
=============================== */

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [tokens, setTokens] = useState(null);
const [loading, setLoading] = useState(true);

/* ===============================
INIT (STABLE)
=============================== */

useEffect(() => {
let mounted = true;

const initAuth = async () => {
  try {
    console.log("🔄 Initialising auth...");

    const isRedirect =
      window.location.search.includes("code=") &&
      window.location.search.includes("state=");

    if (isRedirect) {
      // give Amplify time to hydrate session
      await new Promise((res) => setTimeout(res, 300));
    }

    const session = await fetchAuthSession();

    if (!mounted) return;

    if (session.tokens?.accessToken) {
      const amplifyUser = await getCurrentUser();

      if (!mounted) return;

      const enrichedUser = normaliseUser(amplifyUser, session.tokens);

      setUser(enrichedUser);
      setTokens(session.tokens);

      console.log("✅ Auth restored", {
        user: enrichedUser.displayName,
      });

      // clean URL after OAuth redirect
      if (isRedirect) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } else {
      setUser(null);
      setTokens(null);
    }
  } catch (err) {
    console.error("❌ Auth init failed:", err);
    setUser(null);
    setTokens(null);
  } finally {
    if (mounted) setLoading(false);
  }
};

initAuth();

return () => {
  mounted = false;
};

}, []);

/* ===============================
LOGIN (SAFE)
=============================== */

const login = useCallback(async () => {
if (tokens?.accessToken) {
console.log("⚠️ Already authenticated — skipping login");
return;
}

console.log("🚀 Redirect login");
await signInWithRedirect();

}, [tokens]);

/* ===============================
LOGOUT
=============================== */

const logout = useCallback(async () => {
await signOut({ global: true });

setUser(null);
setTokens(null);

window.location.href = "/";


}, []);

/* ===============================
DERIVED
=============================== */

const isAuthenticated = !!tokens?.accessToken;

/* ===============================
VALUE
=============================== */

const value = useMemo(
() => ({
user,
tokens,
loading,
isAuthenticated,
login,
logout,
}),
[user, tokens, loading, isAuthenticated, login, logout]
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ===============================
HOOK
=============================== */

export const useAuth = () => {
const context = useContext(AuthContext);

if (!context) {
throw new Error("useAuth must be used within AuthProvider");
}

return context;
};
