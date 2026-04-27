import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES
========================= */

import CommunityPlusLandingPage from "../src/pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "../src/pages/Dashboard/CommunityPlusDashboard";
import CommunityPlusOnboarding from "../src/pages/Onboarding/CommunityPlusOnboarding.jsx";
import CommunityPlusUserProfile from "../src/pages/CommunityPlusUserProfile/CommunityPlusUserProfile";

/* =========================
   ROUTE GUARDS
========================= */

/* 🔓 PUBLIC ROUTE (Landing) */
function PublicRoute({ children }) {
  const { user, loading, initialized } = useAuth();

  // 🚧 Block render until auth is resolved
  if (!initialized || loading) {
    return null; // or loader
  }

  // ✅ Already signed in → go to app
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

/* 🔐 PROTECTED ROUTE */
function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* 🧭 ONBOARDING GATE */
function OnboardingGate({ children }) {
  const { appUser, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // 🔥 Enforce onboarding
  if (appUser && !appUser.hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/* =========================
   APP ROUTES
========================= */

function App() {
  return (
    <Routes>
      {/* 🌐 PUBLIC (Landing) */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <CommunityPlusLandingPage />
          </PublicRoute>
        }
      />

      {/* 🧾 ONBOARDING */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <CommunityPlusOnboarding />
          </ProtectedRoute>
        }
      />

      {/* 👤 PROFILE (inside dashboard shell) */}
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

      {/* 🗺️ MAIN APP */}
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

      {/* 🔁 FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;