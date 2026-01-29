import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";

import CommunityPlusLandingPage from "./CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./Dashboard/CommunityPlusDashboard";


/**
 * LandingGate
 * - checks whether a user session exists
 * - while checking, renders the Landing (or a minimal skeleton)
 * - if signed in, redirects to /home
 */
function LandingGate() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await getCurrentUser(); // succeeds if there's a valid session
        if (!cancelled) navigate("/home", { replace: true });
      } catch {
        // no session, stay on landing
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <CommunityPlusLandingPage checkingAuth={checking} />;
}

/**
 * RequireAuth
 * - If user is signed in, render children
 * - If not, bounce to landing
 */
function RequireAuth({ children }) {
  return (
    <Authenticator>
      {({ user }) => (user ? children : <Navigate to="/" replace />)}
    </Authenticator>
  );
}

/**
 * HomeRoute
 * - authenticated route that renders the dashboard
 * - passes user + signOut into the dashboard
 */
function HomeRoute() {
  const navigate = useNavigate();

  return (
    <Authenticator>
      {({ user, signOut }) => {
        if (!user) return <Navigate to="/" replace />;

        const handleSignOut = async () => {
          await signOut();
          navigate("/", { replace: true });
        };

        return (
          <CommunityPlusDashboard
            user={user}
            signOut={handleSignOut}
          />
        );
      }}
    </Authenticator>
  );
}

export default function App() {
  return (
    // Optional but recommended: provides Amplify UI auth state once at the top level
    <Authenticator.Provider>
      <Routes>
        <Route path="/" element={<LandingGate />} />

        {/* Option A: simplest (your current pattern, but safe) */}
        <Route path="/home" element={<HomeRoute />} />

        {/* Option B: if you later add more protected routes, use RequireAuth:
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <CommunityPlusDashboard />
                </RequireAuth>
              }
            />
        */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Authenticator.Provider>
  );
}
