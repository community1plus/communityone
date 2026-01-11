import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import CommunityPlusLandingPage from "./CommunityPlusLandingPage";
import CommunityPlusDashboard from "./CommunityPlusDashboard";
//
/**
 * A small gate that:
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

  // Optional: you can render a tiny loading state instead
  return <CommunityPlusLandingPage checkingAuth={checking} />;
}

/**
 * Protects a route by requiring auth.
 * If not signed in, bounce to /
 */
function ProtectedHome() {
  return (
    <Authenticator>
      {({ user, signOut }) => {
        if (!user) return <Navigate to="/" replace />;
        return <CommunityPlusDashboard user={user} signOut={signOut} />;
      }}
    </Authenticator>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingGate />} />
      <Route path="/home" element={<ProtectedHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

              
              