import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES (MATCH YOUR FOLDERS)
========================= */

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import CommunityPlusOnboarding from "./pages/Onboarding/Onboarding";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";

/* =========================
   ROUTE GUARDS
========================= */

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function OnboardingGate({ children }) {
  const { appUser, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // 🔥 enforce onboarding
  if (appUser && !appUser.hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/* =========================
   APP
========================= */

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* ONBOARDING */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <CommunityPlusOnboarding />
          </ProtectedRoute>
        }
      />

      {/* PROFILE EDIT (INSIDE APP SHELL) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <CommunityPlusDashboard />
            </OnboardingGate>
          </ProtectedRoute>
        }
      >
        <Route index element={<CommunityPlusUserProfile />} />
      </Route>

      {/* DASHBOARD */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <CommunityPlusDashboard />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;