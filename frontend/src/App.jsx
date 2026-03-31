import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import AuthGate from "./pages/AuthGate";
import Onboarding from "./pages/Onboarding";

export default function App() {
  const { user, loading } = useAuth();

  // 🔥 Prevents flicker + race conditions
  if (loading) return null;

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
          AUTH GATE (Profile Check)
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
          PROTECTED DASHBOARD
      ========================= */}
      <Route
        path="/home"
        element={
          user ? <CommunityPlusDashboard /> : <Navigate to="/" replace />
        }
      />

      {/* =========================
          FALLBACK (optional)
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}