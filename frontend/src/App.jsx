import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES
========================= */

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "./pages/CommunityPlusHub/CommunityPlusHub";
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";
import CommunityPlusHome from "./pages/CommunityPlusHome/CommunityPlusHome";
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
   ROUTE GUARDS
========================= */

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <AppLoading />;

  if (!user || !user.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ user, loading, children }) {
  if (loading) return <AppLoading />;

  if (user && user.authenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

/* =========================
   ONBOARDING GUARD (🔥 FIXED)
========================= */

function RequireOnboarding({ appUser, loading, children }) {
  if (loading) return <AppLoading />;

  if (!appUser) return children;

  const path = window.location.pathname;

  // 🔥 allow onboarding route inside dashboard
  if (path.startsWith("/profile-setup")) {
    return children;
  }

  if (!appUser.hasProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

/* =========================
   APP
========================= */

export default function App() {
  const { user, appUser, loading } = useAuth();

  /* =========================
     FAILSAFE
  ========================= */

  if (!loading && (!user || !user.authenticated)) {
    return <CommunityPlusLandingPage />;
  }

  /* =========================
     ROUTES
  ========================= */

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
         APP SHELL (🔥 FIXED)
      ========================= */}
      <Route
        path="/*"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <RequireOnboarding appUser={appUser} loading={loading}>
              <CommunityPlusDashboard />
            </RequireOnboarding>
          </ProtectedRoute>
        }
      >
        {/* DEFAULT */}
        <Route index element={<Navigate to="home" replace />} />

        {/* 🔥 FIX: PROFILE SETUP INSIDE DASHBOARD */}
        <Route path="profile-setup" element={<Onboarding />} />

        {/* CORE */}
        <Route path="home" element={<CommunityPlusHome />} />
        <Route path="communityplus" element={<CommunityPlusHub />} />
        <Route path="channels" element={<CommunityPlusAdTvPage />} />

        {/* PROFILE */}
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