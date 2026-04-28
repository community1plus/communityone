import { Routes, Route, Navigate } from "react-router-dom";
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
   PROTECTED ROUTE WRAPPER
========================= */

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

/* =========================
   DASHBOARD PROVIDERS
========================= */

function DashboardProviders({ children }) {
  return (
    <GoogleMapsProvider>
      <MapProvider>{children}</MapProvider>
    </GoogleMapsProvider>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* =========================
         PUBLIC
      ========================= */}
      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* =========================
         DASHBOARD (PROTECTED)
      ========================= */}
      <Route
        path="/communityplus" /* 🔥 normalize path */
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardProviders>
              <CommunityPlusDashboardLayout />
            </DashboardProviders>
          </ProtectedRoute>
        }
      >
        {/* DEFAULT */}
        <Route index element={<CommunityPlusDashboardHome />} />

        {/* NESTED */}
        <Route path="profile" element={<CommunityPlusUserProfile />} />
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

        {/* FUTURE: FULL MAP MODE */}
        {/* <Route path="map" element={<FullMapPage />} /> */}

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/communityplus" replace />} />
      </Route>

      {/* =========================
         GLOBAL FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}