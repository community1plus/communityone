import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "./pages/CommunityPlusHub/CommunityPlusHub";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusAdTv from "./pages/CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";
import "./styles/tokens.css";
import "./styles/base.css";
import "./Typography/Typography.css";
import "./theme/theme.css";

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

function DashboardHome() {
  return <div style={{ padding: 20 }}>Home content goes here</div>;
}

function PlaceholderPage({ title }) {
  return <div style={{ padding: 20 }}>{title}</div>;
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
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/profile-setup" element={<Onboarding />} />
        <Route path="/profile" element={<CommunityPlusUserProfile />} />
        <Route path="/yellowpages" element={<CommunityPlusYellowPages />} />
        <Route path="/communityplus" element={<CommunityPlusHub />} />
        <Route path="/post" element={<PostComposer />} />
        <Route path="/adtv" element={<CommunityPlusAdTv title="adtv page" />} />
        <Route path="/adtv" element={<CommunityPlusAdTvPage />} />
        <Route path="/event" element={<PlaceholderPage title="Event page" />} />
        <Route path="/incident" element={<PlaceholderPage title="Incident page" />} />
        <Route path="/beacon" element={<PlaceholderPage title="Beacon page" />} />
        <Route path="/search" element={<PlaceholderPage title="Search page" />} />
        <Route path="/about" element={<PlaceholderPage title="About page" />} />
        <Route path="/merch" element={<PlaceholderPage title="Merch page" />} />
        
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}