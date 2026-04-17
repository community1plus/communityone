import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate/AuthGate";

/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/* =========================
   PUBLIC ROUTE
========================= */
function PublicRoute({ user, children }) {
  if (user) return <Navigate to="/auth-gate" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Initialising...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute user={user}>
            <CommunityPlusLandingPage />
          </PublicRoute>
        }
      />

      <Route
        path="/auth-gate"
        element={
          <ProtectedRoute user={user}>
            <AuthGate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute user={user}>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}