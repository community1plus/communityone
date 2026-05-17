import { createContext, useContext, useMemo } from "react";

import { useAuth } from "./AuthContext";
import { useMap } from "./MapContext";

const SessionContext = createContext();

export function SessionProvider({ children }) {
const { user, isAuthenticated, loading: authLoading } = useAuth();
const { resolvedLocation } = useMap();

/* ===============================
DERIVED SESSION STATE
=============================== */

const isReady = !authLoading && !!resolvedLocation;

const session = useMemo(() => ({
user,
location: resolvedLocation,
isAuthenticated,
isReady,
}), [user, resolvedLocation, isAuthenticated, isReady]);

return (
<SessionContext.Provider value={session}>
{children}
</SessionContext.Provider>
);
}

export function useSession() {
const context = useContext(SessionContext);

if (!context) {
throw new Error("useSession must be used within SessionProvider");
}

return context;
}
