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
LOAD USER (CRITICAL)
=============================== */

const loadUser = async () => {
try {
await fetchAuthSession(); // 🔥 ensures OAuth completes
const currentUser = await getCurrentUser();
setUser(currentUser);
} catch {
setUser(null);
} finally {
setLoading(false);
}
};

/* INITIAL LOAD */
useEffect(() => {
loadUser();
}, []);

/* LISTEN FOR OAUTH RETURN */
useEffect(() => {
const unsubscribe = Hub.listen("auth", ({ payload }) => {
if (payload.event === "signedIn") {
loadUser();
}


  if (payload.event === "signedOut") {
    setUser(null);
  }
});

return unsubscribe;


}, []);

/* LOGOUT */
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
