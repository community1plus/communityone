
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import AuthGate from "../src/pages/AuthGate";

/* =========================
   PAGES (CORRECT IMPORTS)
========================= */

import CommunityPlusLandingPage from "../pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusDashboard from "../pages/Dashboard/CommunityPlusDashboard";
import CommunityPlusYellowPages from "../pages/YellowPages/CommunityPlusYellowPages";

/* =========================
   APP
========================= */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🔓 PUBLIC */}
          <Route path="/" element={<CommunityPlusLandingPage />} />

          {/* 🔐 PROTECTED */}
          <Route
            path="/CommunityPlusDashboard"
            element={
              <AuthGate>
                <CommunityPlusDashboard />
              </AuthGate>
            }
          />

          <Route
            path="/YellowPages"
            element={
              <AuthGate>
                <CommunityPlusYellowPages />
              </AuthGate>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}