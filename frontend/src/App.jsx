import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";
/* =========================
   LOADING SCREEN
========================= */
function AppLoading() {
  return <div style={{ padding: 20 }}>Initialising...</div>;
}

/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ user, children }) {
  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* =========================
   PUBLIC ROUTE
========================= */
function PublicRoute({ user, children }) {
  if (user?.authenticated) {
    return <Navigate to="/auth-gate" replace />;
  }

  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  return (
    <Routes>
      {/* LANDING */}
      <Route
        path="/"
        element={
          <PublicRoute user={user}>
            <CommunityPlusLandingPage />
          </PublicRoute>
        }
      />

      {/* AUTH GATE */}
      <Route
        path="/auth-gate"
        element={
          <ProtectedRoute user={user}>
            <AuthGate />
          </ProtectedRoute>
        }
      />

      {/* ONBOARDING */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute user={user}>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* HOME */}
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/post" element={<PostComposer />} />
      <Route path="/event" element={<EventPage />} />
      <Route path="/incident" element={<IncidentPage />} />
      <Route path="/beacon" element={<BeaconPage />} />

    </Routes>
  );
}