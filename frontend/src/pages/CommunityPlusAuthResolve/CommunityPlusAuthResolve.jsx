import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

export default function CommunityPlusAuthResolve() {
  const { loading, isAuthenticated, isGuest } = useAuth();

  const {
    profileReady,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
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