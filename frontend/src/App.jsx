import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* PAGES */
import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboardLayout from "./components/Layout/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/Dashboard/CommunityPlusDashboard"; // 👈 your main map/home
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import CommunityPlusYellowPages from "./pages/YellowPages/CommunityPlusYellowPages";

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  // 🚧 Prevent flicker / race conditions
  if (loading) return null;

  return (
    <Routes>
      {/* =========================
         PUBLIC
      ========================= */}
      <Route path="/" element={<CommunityPlusLandingPage />} />

      {/* =========================
         PROTECTED
      ========================= */}
      <Route
        path="/CommunityPlusDashboard/*"
        element={
          isAuthenticated ? (
            <CommunityPlusDashboardLayout />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        {/* 🔥 DEFAULT DASHBOARD PAGE */}
        <Route index element={<CommunityPlusDashboardHome />} />

        {/* 🔥 NESTED PAGES */}
        <Route path="profile" element={<CommunityPlusUserProfile />} />
        <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

        {/* 🔥 CATCH-ALL INSIDE DASHBOARD */}
        <Route path="*" element={<Navigate to="/CommunityPlusDashboard" replace />} />
      </Route>

      {/* =========================
         GLOBAL FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}