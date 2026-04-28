import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* CONTEXT */
import { MapProvider } from "./context/MapContext";
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";

/* PAGES */
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";

/* =========================
   PROTECTED ROUTE (FIXED)
========================= */

function ProtectedRoute({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // 🔥 prevents rerender loops
}

/* =========================
   DASHBOARD PROVIDERS
========================= */

function DashboardProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <Outlet />
      </MapProvider>
    </GoogleMapsProvider>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  /* =========================
     LOADING STATE (IMPORTANT)
  ========================= */

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Initialising...
      </div>
    );
  }

  return (
    <Routes>
      {/* =========================
         PUBLIC
      ========================= */}
      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* =========================
         PROTECTED LAYER
      ========================= */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        
        {/* PROVIDERS LAYER */}
        <Route element={<DashboardProviders />}>
          
          {/* DASHBOARD LAYOUT */}
          <Route
            path="/communityplus"
            element={<CommunityPlusDashboardLayout />}
          >
            {/* DEFAULT */}
            <Route index element={<CommunityPlusDashboardHome />} />

            {/* NESTED */}
            <Route path="profile" element={<CommunityPlusUserProfile />} />
            <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

            {/* FUTURE */}
            {/* <Route path="map" element={<FullMapPage />} /> */}

            {/* CATCH-ALL */}
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