import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

export default function CommunityPlusAuthResolve() {
 

  const {
    loading,
    isAuthenticated,
    isGuest,
    user,
  } = useAuth();

  const {
    profileReady,
    hasProfile,
  } = useProfile();



  console.log("AUTH RESOLVE:", {
    loading,
    isAuthenticated,
    isGuest,
    user,
    profileReady,
    hasProfile,
  });

  if (loading) {
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