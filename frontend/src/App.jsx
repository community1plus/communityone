import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* =========================
   PAGES (✅ VERIFY PATHS)
========================= */

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "./pages/Dashboard/CommunityPlusDashboard";
import Onboarding from "./pages/Onboarding/CommunityPlusOnboarding";
import AuthGate from "./pages/AuthGate";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";
import CommunityPlusHub from "./pages/CommunityPlusHub/CommunityPlusHub";
import CommunityPlusAdTvPage from "./pages/CommunityPlusAdTvPage/CommunityPlusAdTvPage";
import CommunityPlusHome from "./pages/CommunityPlusHome/CommunityPlusHome";

/* 🔥 IMPORTANT: this path is often wrong */
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
   ROUTE GUARDS (SIMPLIFIED)
========================= */

function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;

  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function RequirePublic() {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;

  if (user?.authenticated) {
    return <Navigate to="/auth-gate" replace />;
  }

  return <Outlet />;
}

/* =========================
   APP
========================= */

export default function App() {
  return (
    <Routes>

      {/* =========================
         PUBLIC
      ========================= */}
      <Route element={<RequirePublic />}>
        <Route path="/" element={<CommunityPlusLandingPage />} />
      </Route>

      {/* =========================
         AUTH GATE
      ========================= */}
      <Route element={<RequireAuth />}>
        <Route path="/auth-gate" element={<AuthGate />} />
      </Route>

      {/* =========================
         APP SHELL
      ========================= */}
      <Route element={<RequireAuth />}>
        <Route path="/*" element={<CommunityPlusDashboard />}>

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
      </Route>

      {/* =========================
         FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

/* =========================
   SIMPLE PAGE (avoids inline JSX duplication)
========================= */

function SimplePage({ title }) {
  return <div style={{ padding: 20 }}>{title}</div>;
}