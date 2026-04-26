import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import CommunityPlusHub from "./pages/CommunityPlusHub/CommunityPlusHub";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";
import CommunityPlusHome from "./pages/CommunityPlusHome/CommunityPlusHome";

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
   AUTH HELPERS
========================= */

function usePermissions() {
  const { user, appUser } = useAuth();

  return {
    role: appUser?.role || user?.role || "user",
    features: appUser?.features || user?.features || [],
  };
}

/* =========================
   ROUTE GUARDS
========================= */

function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;
  if (!user?.authenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

function RequirePublic() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;
  if (user?.authenticated) return <Navigate to="/auth-gate" replace />;

  return <Outlet />;
}

/* =========================
   FEATURE GUARD
========================= */

function RequireFeature({ feature }) {
  const { features } = usePermissions();

  if (!features.includes(feature)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

/* =========================
   ROLE GUARD
========================= */

function RequireRole({ roles }) {
  const { role } = usePermissions();

  if (!roles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

/* =========================
   APP
========================= */

export default function App() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route element={<RequirePublic />}>
        <Route path="/" element={<CommunityPlusLandingPage />} />
      </Route>

      {/* AUTH GATE */}
      <Route element={<RequireAuth />}>
        <Route path="/auth-gate" element={<AuthGate />} />
      </Route>

      {/* APP SHELL */}
      <Route element={<RequireAuth />}>
        <Route path="/*" element={<CommunityPlusDashboard />}>

          {/* DEFAULT */}
          <Route index element={<Navigate to="home" replace />} />

          {/* CORE */}
          <Route path="home" element={<CommunityPlusHome />} />
          <Route path="communityplus" element={<CommunityPlusHub />} />

          {/* FEATURE-GATED */}
          <Route element={<RequireFeature feature="ads" />}>
            <Route path="channels" element={<CommunityPlusAdTvPage />} />
          </Route>

          {/* PROFILE */}
          <Route path="profile-setup" element={<Onboarding />} />
          <Route path="profile" element={<CommunityPlusUserProfile />} />

          {/* DIRECTORY (feature gated) */}
          <Route element={<RequireFeature feature="yellowpages" />}>
            <Route path="yellowpages" element={<CommunityPlusYellowPages />} />
          </Route>

          {/* ACTIONS */}
          <Route element={<RequireFeature feature="posts" />}>
            <Route path="post" element={<PostComposer />} />
          </Route>

          {/* ROLE-GATED (example) */}
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="admin" element={<div>Admin Panel</div>} />
          </Route>

          {/* BASIC */}
          <Route path="event" element={<div style={{ padding: 20 }}>Event</div>} />
          <Route path="incident" element={<div style={{ padding: 20 }}>Incident</div>} />
          <Route path="beacon" element={<div style={{ padding: 20 }}>Beacon</div>} />

        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}