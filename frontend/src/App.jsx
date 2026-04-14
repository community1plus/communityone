import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";

/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/* =========================
   PUBLIC ROUTE (BLOCK IF LOGGED IN)
========================= */
function PublicRoute({ user, children }) {
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  /* =========================
     🔥 CRITICAL FIX
     DO NOT BLOCK RENDER
  ========================= */
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Initialising...
      </div>
    );
  }

  return (
    <Routes>

      {/* =========================
          LANDING
      ========================= */}
      <Route
        path="/"
        element={
          <PublicRoute user={user}>
            <CommunityPlusLandingPage />
          </PublicRoute>
        }
      />

      {/* =========================
          ONBOARDING (FIRST LOGIN)
      ========================= */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute user={user}>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* =========================
          DASHBOARD
      ========================= */}
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      />

      {/* =========================
          FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}