import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import { MapProvider } from "./context/MapContext";
import { SessionProvider } from "./context/sessionContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusAboutPage from "./pages/CommunityPlusAboutPage/CommunityPlusAboutPage";
import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";
import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusIViewPage from "./pages/CommunityPlusIViewPage/CommunityPlusIViewPage";
import CommunityPlusChannels from "./pages/communityPlusChannels/communityPlusChannels
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";

function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, loading, authLoading } = useAuth();

  const isAuthChecking = loading || authLoading;

  console.log("PROTECTED ROUTE STATE:", {
    user,
    isAuthenticated,
    loading,
    authLoading,
    isAuthChecking,
  });

  if (isAuthChecking) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          loginRequired: true,
          returnTo: location.pathname + location.search,
        }}
      />
    );
  }

  return children;
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
  return (
    <Routes>
      <Route path="/" element={<CommunityPlusLandingPage />} />

      <Route element={<DashboardProviders />}>
        <Route path="/communityplus" element={<CommunityPlusDashboardLayout />}>
          {/* PUBLIC / GUEST BROWSING */}
          <Route index element={<CommunityPlusDashboardHome />} />
          <Route path="iview" element={<CommunityPlusIViewPage />} />
          <Route path="about" element={<CommunityPlusAboutPage />} />
          <Route path="yellowpages" element={<CommunityPlusYellowPages />} />
          <Route path="channels" element={<CommunityPlusChannels />} />
          <Route path="help" element={<Placeholder title="Help" />} />

          {/* PROTECTED */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <CommunityPlusUserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="compose/:mode"
            element={
              <ProtectedRoute>
                <PostComposer />
              </ProtectedRoute>
            }
          />

          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Placeholder title="Account" />
              </ProtectedRoute>
            }
          />

          <Route
            path="inbox"
            element={
              <ProtectedRoute>
                <Placeholder title="Inbox" />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/communityplus" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}