import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

export default function CommunityPlusAuthResolve() {
  const [checkedAuth, setCheckedAuth] = useState(false);

  const {
    loading,
    isAuthenticated,
    isGuest,
    refreshAuth,
  } = useAuth();

  const {
    profileReady,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        await refreshAuth();
      } catch (err) {
        console.error("Auth resolve refresh failed:", err);
      } finally {
        if (active) {
          setCheckedAuth(true);
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [refreshAuth]);

  console.log("AUTH RESOLVE:", {
    loading,
    checkedAuth,
    isAuthenticated,
    isGuest,
    profileReady,
    hasProfile,
    isProfileComplete,
  });

  if (loading || !checkedAuth) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isGuest) {
    return <Navigate to="/communityplus" replace />;
  }

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  if (!hasProfile || !isProfileComplete) {
    return <Navigate to="/communityplus/profile" replace />;
  }

  return <Navigate to="/communityplus" replace />;
}