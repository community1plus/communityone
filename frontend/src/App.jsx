import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES
========================= */

import CommunityPlusLandingPage from "../pages/Landing/CommunityPlusLandingPage";
import CommunityPlusDashboard from "../pages/Dashboard/CommunityPlusDashboard";
import CommunityPlusOnboarding from "../pages/Profile/CommunityPlusOnboarding";

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
      {/* =========================
         PUBLIC
      ========================= */}

      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* =========================
         ONBOARDING
      ========================= */}

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <CommunityPlusOnboarding />
          </ProtectedRoute>
        }
      />

      {/* =========================
         DASHBOARD
      ========================= */}

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

      {/* =========================
         FALLBACK
      ========================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* =========================
   🔥 THIS FIXES YOUR ERROR
========================= */

export default App;