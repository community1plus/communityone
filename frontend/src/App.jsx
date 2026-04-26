import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "../src/pages/CommunityPlusHub/CommunityPlusHub";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";

// 🔥 replace later with your real Home (feed + map)
import CommunityPlusHome from "./pages/CommunityPlusHome/CommunityPlusHome"
import "./styles/tokens.css";
import "./styles/base.css";
import "./Typography/Typography.css";
import "./theme/theme.css";

/* =========================
   LOADING
========================= */

function AppLoading() {
  return <div style={{ padding: 20 }}>Initialising...</div>;
}

/* =========================
   ROUTE GUARDS
========================= */

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

/* =========================
   APP
========================= */

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;

  return (
    <Routes>

      {/* =========================
         PUBLIC
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
         AUTH GATE
      ========================= */}
      <Route
        path="/auth-gate"
        element={
          <ProtectedRoute user={user}>
            <AuthGate />
          </ProtectedRoute>
        }
      />

      {/* =========================
         APP SHELL (DASHBOARD)
      ========================= */}
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      >

        {/* 🔥 default redirect */}
        <Route index element={<Navigate to="home" replace />} />

        {/* =========================
           CORE
        ========================= */}
        <Route path="home" element={<CommunityPlusHome />} />
        <Route path="communityplus" element={<CommunityPlusHub />} />
        <Route path="channels" element={<CommunityPlusAdTvPage />} />

        {/* =========================
           PROFILE
        ========================= */}
        <Route path="profile-setup" element={<Onboarding />} />
        <Route path="profile" element={<CommunityPlusUserProfile />} />

        {/* =========================
           DIRECTORY
        ========================= */}
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

        {/* =========================
           ACTIONS
        ========================= */}
        <Route path="post" element={<PostComposer />} />
        <Route path="event" element={<div style={{ padding: 20 }}>Event</div>} />
        <Route path="incident" element={<div style={{ padding: 20 }}>Incident</div>} />
        <Route path="beacon" element={<div style={{ padding: 20 }}>Beacon</div>} />

        {/* =========================
           MISC
        ========================= */}
        <Route path="search" element={<div style={{ padding: 20 }}>Search</div>} />
        <Route path="about" element={<div style={{ padding: 20 }}>About</div>} />
        <Route path="merch" element={<div style={{ padding: 20 }}>Merch</div>} />

      </Route>

      {/* =========================
         FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}