import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useGoogleMaps } from "./context/GoogleMapsProvider"; // 🔥 NEW

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import AuthGate from "./pages/AuthGate";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";

export default function App() {
  const { user, loading } = useAuth();

  // 🔥 GLOBAL GOOGLE MAPS LOADER
  const { isLoaded } = useGoogleMaps();

  // 🔥 Prevent flicker + auth race
  if (loading) return null;

  // 🔥 Prevent Google Maps race condition
  if (!isLoaded || !window.google) {
    return <div style={{ padding: 20 }}>Loading maps...</div>;
  }

  return (
    <Routes>

      {/* =========================
          PUBLIC (Landing)
      ========================= */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/auth" replace /> : <CommunityPlusLandingPage />
        }
      />

      {/* =========================
          AUTH GATE
      ========================= */}
      <Route
        path="/auth"
        element={
          user ? <AuthGate /> : <Navigate to="/" replace />
        }
      />

      {/* =========================
          ONBOARDING
      ========================= */}
      <Route
        path="/onboarding"
        element={
          user ? <Onboarding /> : <Navigate to="/" replace />
        }
      />

      {/* =========================
          DASHBOARD (MAP DEPENDENT)
      ========================= */}
      <Route
        path="/home"
        element={
          user
            ? <CommunityPlusDashboard isLoaded={isLoaded} /> // 🔥 PASS DOWN
            : <Navigate to="/" replace />
        }
      />

      {/* =========================
          FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}