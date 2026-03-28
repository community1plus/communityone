import React, { createContext, useContext, useEffect, useState } from "react";
import {
getCurrentUser,
fetchAuthSession,
signOut,
fetchUserAttributes
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

/* ===============================
NORMALISE USER (🔥 KEY UPGRADE)
=============================== */

const buildUserObject = (currentUser, attributes) => {
// Best possible display name resolution
const displayName =
attributes?.name ||                                   // full name (best)
attributes?.given_name ||                             // fallback first name
attributes?.email?.split("@")[0] ||                   // email prefix
currentUser?.username ||                              // cognito fallback
"User";

```
return {
  ...currentUser,
  attributes,
  displayName
};
```

};

/* ===============================
LOAD USER (INITIAL + REFRESH)
=============================== */

const loadUser = async () => {
try {
// ensure tokens ready (critical after OAuth redirect)
await fetchAuthSession();

```
  const currentUser = await getCurrentUser();

  // 🔥 NEW: fetch attributes
  const attributes = await fetchUserAttributes();

  const enrichedUser = buildUserObject(currentUser, attributes);

  setUser(enrichedUser);

} catch (err) {
  setUser(null);
} finally {
  setLoading(false);
}
```

};

/* ===============================
INITIAL LOAD
=============================== */

useEffect(() => {
loadUser();
}, []);

/* ===============================
LISTEN TO AUTH EVENTS
=============================== */

useEffect(() => {
const unsubscribe = Hub.listen("auth", ({ payload }) => {
const { event } = payload;

```
  if (event === "signedIn") {
    loadUser(); // 🔥 handles OAuth redirect return
  }

  if (event === "signedOut") {
    setUser(null);
  }
});

return unsubscribe;
```

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
