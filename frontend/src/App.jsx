import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";

/* CONTEXT */
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import { MapProvider } from "./context/MapContext";
import { SessionProvider } from "./context/sessionContext";

/* PAGES */
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusAboutPage from "./pages/CommunityPlusAboutPage/CommunityPlusAboutPage";
import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";
import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";

/* =====================================================
   PLACEHOLDER
===================================================== */
function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

/* =====================================================
   PROTECTED ROUTE
===================================================== */
function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/* =====================================================
   PROFILE GATE
===================================================== */
function ProfileGate() {
  const { profileReady, hasProfile } = useProfile();

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  if (!hasProfile) {
    return <Navigate to="/communityplus/profile" replace />;
  }

  return <Outlet />;
}

/* =====================================================
   PROVIDERS
===================================================== */
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

/* =====================================================
   APP
===================================================== */
export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* ================= PROTECTED ================= */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardProviders />}>
          <Route
            path="/communityplus"
            element={<CommunityPlusDashboardLayout />}
          >
            {/* ================= UNGATED ================= */}
            <Route path="about" element={<CommunityPlusAboutPage />} />

            <Route
              path="profile"
              element={<CommunityPlusUserProfile />}
            />

            {/* ================= PROFILE GATED ================= */}
            <Route element={<ProfileGate />}>
              <Route index element={<CommunityPlusDashboardHome />} />

              <Route
                path="yellowpages"
                element={<CommunityPlusYellowPages />}
              />

              <Route path="compose">
                <Route path="now" element={<PostComposer mode="now" />} />
                <Route path="news" element={<PostComposer mode="news" />} />
                <Route path="blob" element={<PostComposer mode="blob" />} />
                <Route path="event" element={<PostComposer mode="event" />} />
                <Route path="beacon" element={<PostComposer mode="beacon" />} />
              </Route>

              <Route
                path="channels"
                element={<Placeholder title="Channels" />}
              />

              <Route
                path="account"
                element={<Placeholder title="Account" />}
              />

              <Route
                path="inbox"
                element={<Placeholder title="Inbox" />}
              />

              <Route
                path="help"
                element={<Placeholder title="Help" />}
              />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route
              path="*"
              element={<Navigate to="/communityplus" replace />}
            />
          </Route>
        </Route>
      </Route>

      {/* ================= GLOBAL FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}