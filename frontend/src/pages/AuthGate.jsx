import { useAuth } from "../context/AuthContext";

import CommunityPlusLandingPage from "../pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "../pages/Dashboard/CommunityPlusDashboard";
import CommunityPlusOnboarding from "../pages/Onboarding/CommunityPlusOnboarding";

export default function AuthGate() {
  const { user, appUser, appUserStatus, loading, initialized } = useAuth();

  /* =========================
     BLOCK INITIAL LOAD
  ========================= */

  if (!initialized || loading) {
    return null; // or splash
  }

  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!user) {
    return <CommunityPlusLandingPage />;
  }

  /* =========================
     WAIT FOR BACKEND
  ========================= */

  if (appUserStatus === "loading") {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  /* =========================
     BACKEND FAILURE
  ========================= */

  if (appUserStatus === "error") {
    return <CommunityPlusDashboard />;
  }

  /* =========================
     ONBOARDING
  ========================= */

  if (appUser && !appUser.hasProfile) {
    return <CommunityPlusOnboarding />;
  }

  /* =========================
     NORMAL FLOW
  ========================= */

  return <CommunityPlusDashboard />;
}