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
import PostComposer from "./components/PostComposer/PostComposer";

function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

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

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Initialising...</div>;
  }

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<CommunityPlusLandingPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardProviders />}>
          <Route element={<ProfileGate />}>
            <Route
              path="/communityplus"
              element={<CommunityPlusDashboardLayout />}
            >
              <Route index element={<CommunityPlusDashboardHome />} />

              <Route path="profile" element={<CommunityPlusUserProfile />} />

              <Route path="compose/now" element={<PostComposer mode="now" />} />
              <Route path="compose/news" element={<PostComposer mode="news" />} />
              <Route path="compose/blob" element={<PostComposer mode="blob" />} />
              <Route path="compose/event" element={<PostComposer mode="event" />} />
              <Route
                path="compose/beacon"
                element={<PostComposer mode="beacon" />}
              />

              <Route
                path="yellowpages"
                element={<CommunityPlusYellowPages />}
              />

              <Route path="channels" element={<Placeholder title="Channels" />} />
              <Route path="account" element={<Placeholder title="Account" />} />
              <Route path="inbox" element={<Placeholder title="Inbox" />} />
              <Route path="help" element={<Placeholder title="Help" />} />

              <Route
                path="*"
                element={<Navigate to="/communityplus" replace />}
              />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}