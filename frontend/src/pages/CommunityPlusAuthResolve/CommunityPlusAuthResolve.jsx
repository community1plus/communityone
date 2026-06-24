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
    user,
    refreshAuth,
  } = useAuth();

  const {
    profileReady,
    hasProfile,
  } = useProfile();

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        await refreshAuth?.();
      } finally {
        if (active) setCheckedAuth(true);
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [refreshAuth]);

  console.log("AUTH RESOLVE:", {
    checkedAuth,
    loading,
    isAuthenticated,
    isGuest,
    user,
    profileReady,
    hasProfile,
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

  // Important: wait until AuthContext exposes the real user
  if (!user) {
    return <div style={{ padding: 40 }}>Loading account...</div>;
  }

  // Then wait for ProfileContext to resolve using that user
  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

   console.log("AUTH RESOLVE FINAL", {
  profileReady,
  hasProfile,
});

  if (!hasProfile) {
    return <Navigate to="/communityplus/profile" replace />;
  }

  return <Navigate to="/communityplus" replace />;
}