import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CommunityPlusLandingPage from "./components/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./components/CommunityPlusDashboard/CommunityPlusDashboard";

export default function App() {
  const { user, loading } = useAuth();

  /* ===============================
     🔥 AUTH GATE (CRITICAL FIX)
  =============================== */

  if (loading) {
    return (
      <div className="auth-loading-overlay">
        <div className="auth-loading-box">Loading session…</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* LANDING */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/home" replace /> : <CommunityPlusLandingPage />
        }
      />

      {/* DASHBOARD (PROTECTED) */}
      <Route
        path="/home"
        element={
          user ? <CommunityPlusDashboard /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}