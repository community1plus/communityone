import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* 🔥 CONTEXT */
import { MapProvider } from "./context/MapContext";

/* PAGES */
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";

/* ✅ USE THE CORRECT DASHBOARD */
import CommunityPlusDashboard from "./pages/CommunityPlusDashboard/CommunityPlusDashboard";

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
         PROTECTED (WITH MAP CONTEXT)
      ========================= */}
      <Route
        path="/CommunityPlusDashboard/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MapProvider>
              {/* ✅ FIXED: correct dashboard */}
              <CommunityPlusDashboard />
            </MapProvider>
          </ProtectedRoute>
        }
      >
        {/* ✅ DEFAULT HOME (renders in Outlet) */}
        <Route index element={<CommunityPlusDashboardHome />} />

        {/* NESTED ROUTES */}
        <Route path="profile" element={<CommunityPlusUserProfile />} />
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

        {/* CATCH-ALL */}
        <Route
          path="*"
          element={<Navigate to="/CommunityPlusDashboard" replace />}
        />
      </Route>

      {/* GLOBAL FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}