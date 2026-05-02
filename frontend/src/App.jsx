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

/* =========================
PROTECTED ROUTE
========================= */

function ProtectedRoute({ isAuthenticated }) {
if (!isAuthenticated) {
return <Navigate to="/" replace />;
}

return <Outlet />;
}

/* =========================
DASHBOARD PROVIDERS
========================= */

function DashboardProviders() {
return ( <GoogleMapsProvider> <MapProvider> <SessionProvider> <Outlet /> </SessionProvider> </MapProvider> </GoogleMapsProvider>
);
}

/* =========================
APP
========================= */

export default function App() {
const { loading, isAuthenticated } = useAuth();

/* =========================
LOADING STATE
========================= */

if (loading) {
return <div style={{ padding: 40 }}>Initialising...</div>;
}

return ( <Routes>

  {/* =========================
     PUBLIC (SMART REDIRECT)
  ========================= */}

  <Route
    path="/"
    element={
      isAuthenticated
        ? <Navigate to="/communityplus" replace />
        : <CommunityPlusLandingPage />
    }
  />

  {/* =========================
     PROTECTED LAYER
  ========================= */}

  <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>

    {/* PROVIDERS */}
    <Route element={<DashboardProviders />}>

      {/* DASHBOARD */}
      <Route
        path="/communityplus"
        element={<CommunityPlusDashboardLayout />}
      >
        <Route index element={<CommunityPlusDashboardHome />} />
        <Route path="profile" element={<CommunityPlusUserProfile />} />
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />
        <Route path="/communityplus/now" element={<CommunityPlusNowPostView />} />

        <Route
          path="*"
          element={<Navigate to="/communityplus" replace />}
        />
      </Route>

    </Route>
  </Route>

  {/* =========================
     GLOBAL FALLBACK
  ========================= */}

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

);
}
