import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES
========================= */

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "./pages/CommunityPlusHub/CommunityPlusHub"; // ✅ FIXED
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";
import CommunityPlusHome from "./pages/CommunityPlusHome/CommunityPlusHome";

/* 🔥 check this path exists */
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";

/* =========================
   STYLES
========================= */

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
   ROUTE GUARDS (FIXED)
========================= */

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <AppLoading />;

  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ user, loading, children }) {
  if (loading) return <AppLoading />;

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

  return (
    <Routes>

      {/* =========================
         PUBLIC
      ========================= */}
      <Route
        path="/"
        element={
          <PublicRoute user={user} loading={loading}>
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
          <ProtectedRoute user={user} loading={loading}>
            <AuthGate />
          </ProtectedRoute>
        }
      />

      {/* =========================
         DASHBOARD (🔥 FIXED PATH)
      ========================= */}
      <Route
        path="/*"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <CommunityPlusDashboard />
          </ProtectedRoute>
        }
      >
        {/* DEFAULT */}
        <Route index element={<Navigate to="home" replace />} />

        {/* CORE */}
        <Route path="home" element={<CommunityPlusHome />} />
        <Route path="communityplus" element={<CommunityPlusHub />} />
        <Route path="channels" element={<CommunityPlusAdTvPage />} />

        {/* PROFILE */}
        <Route path="profile-setup" element={<Onboarding />} />
        <Route path="profile" element={<CommunityPlusUserProfile />} />

        {/* DIRECTORY */}
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

        {/* ACTIONS */}
        <Route path="post" element={<PostComposer />} />
        <Route path="event" element={<SimplePage title="Event" />} />
        <Route path="incident" element={<SimplePage title="Incident" />} />
        <Route path="beacon" element={<SimplePage title="Beacon" />} />

        {/* MISC */}
        <Route path="search" element={<SimplePage title="Search" />} />
        <Route path="about" element={<SimplePage title="About" />} />
        <Route path="merch" element={<SimplePage title="Merch" />} />
      </Route>

      {/* =========================
         FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

/* =========================
   SIMPLE PAGE
========================= */

function SimplePage({ title }) {
  return <div style={{ padding: 20 }}>{title}</div>;
}