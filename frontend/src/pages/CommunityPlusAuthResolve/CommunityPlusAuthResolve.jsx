import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

export default function CommunityPlusAuthResolve() {
  const {
    loading,
    isAuthenticated,
    isGuest,
  } = useAuth();

  const {
    profile,
    profileReady,
    hasProfile,
    isProfileComplete,
  } = useProfile();

  if (
    loading ||
    (isAuthenticated && !isGuest && !profileReady)
  ) {
    return (
      <div style={{ padding: 40 }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isGuest) {
    return <Navigate to="/communityplus" replace />;
  }

  if (
    !hasProfile ||
    !isProfileComplete ||
    profile === null
  ) {
    return (
      <Navigate
        to="/communityplus/profile"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/communityplus"
      replace
    />
  );
}