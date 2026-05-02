import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

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

        {/* ✅ CONTENT PANE */}
        <main className="layout-content">
          <div className="layout-inner">
            <Outlet />   {/* 🔥 THIS RENDERS HOME */}
          </div>
        </main>
      </div>
    </div>
  );
}