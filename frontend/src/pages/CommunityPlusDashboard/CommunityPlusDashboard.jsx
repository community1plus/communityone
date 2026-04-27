// pages/CommunityPlusDashboard.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import CommunityMap from "../components/Map/CommunityMap";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="cp-header">
        <div>Community+</div>

        <nav>
          <button onClick={() => navigate("/CommunityPlusDashboard")}>
            Home
          </button>
          <button onClick={() => navigate("/CommunityPlusDashboard/profile")}>
            Profile
          </button>
        </nav>
      </header>

      {/* MAIN */}
      <div className="layout-main">
        {/* SIDEBAR */}
        <aside className="sidebar">Sidebar</aside>

        {/* CONTENT */}
        <main className="layout-content full-width">
          {/* 🗺️ MAP (ALWAYS MOUNTED) */}
          <CommunityMap />

          {/* 🧩 OVERLAY LAYER */}
          <div className="overlay-layer">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}