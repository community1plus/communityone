import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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

/* TEMP PLACEHOLDER */
function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

function ProtectedRoute({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function DashboardProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SessionProvider>
          <Outlet />
        </SessionProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
}

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Initialising...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/communityplus" replace />
          ) : (
            <CommunityPlusLandingPage />
          )
        }
      />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<DashboardProviders />}>
          <Route
            path="/communityplus"
            element={<CommunityPlusDashboardLayout />}
          >
            <Route index element={<CommunityPlusDashboardHome />} />

            <Route path="now" element={<CommunityPlusNowPostView />} />
            <Route path="profile" element={<CommunityPlusUserProfile />} />
            <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}