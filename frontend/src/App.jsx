import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";

/* CONTEXT */
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import { MapProvider } from "./context/MapContext";
import { SessionProvider } from "./context/sessionContext";

/* PAGES */
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";
import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusNowPostView from "./pages/CommunityPlusNowPostView";

/* ===============================
   TEMP PLACEHOLDER
=============================== */

function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

/* ===============================
   ROUTE GUARDS
=============================== */

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/communityplus" replace />;
  }

  return <Outlet />;
}

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function ProfileGate() {
  const location = useLocation();
  const { profileReady, hasProfile } = useProfile();

  const isProfilePage = location.pathname === "/communityplus/profile";

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  if (!hasProfile && !isProfilePage) {
    return <Navigate to="/communityplus/profile" replace />;
  }

  return <Outlet />;
}

/* ===============================
   PROVIDERS
=============================== */

function DashboardProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SessionProvider>
          <ProfileProvider>
            <Outlet />
          </ProfileProvider>
        </SessionProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
}

/* ===============================
   APP
=============================== */

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Initialising...</div>;
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<CommunityPlusLandingPage />} />
      </Route>

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardProviders />}>
          <Route element={<ProfileGate />}>
            <Route
              path="/communityplus"
              element={<CommunityPlusDashboardLayout />}
            >
              <Route index element={<CommunityPlusDashboardHome />} />

              <Route path="profile" element={<CommunityPlusUserProfile />} />
              <Route path="now" element={<CommunityPlusNowPostView />} />
              <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

              <Route path="account" element={<Placeholder title="Account" />} />
              <Route path="inbox" element={<Placeholder title="Inbox" />} />
              <Route path="help" element={<Placeholder title="Help" />} />

              <Route
                path="*"
                element={<Navigate to="/communityplus/profile" replace />}
              />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}