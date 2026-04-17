import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CommunityPlusLandingPage from "../CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard, {
  CommunityPlusDashboardHome,
} from "../Dashboard/CommunityPlusDashboard";
import Onboarding from "../Onboarding/CommunityPlusOnboarding";
import AuthGate from "../AuthGate";
import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "../YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "../CommunityPlusHub/CommunityPlusHub";

function AppLoading() {
  return <div style={{ padding: 20 }}>Initialising...</div>;
}

function ProtectedRoute({ user, children }) {
  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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
        element={
          <ProtectedRoute user={user}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<CommunityPlusDashboardHome />} />
        <Route path="/profile-setup" element={<Onboarding />} />
        <Route path="/profile" element={<CommunityPlusUserProfile />} />
        <Route path="/yellowpages" element={<CommunityPlusYellowPages />} />
        <Route path="/communityplus" element={<CommunityPlusHub />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}