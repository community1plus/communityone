import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ===============================
     NAV ITEMS (SCALABLE)
  =============================== */
  const navItems = useMemo(
    () => [
      { label: "Home", path: "/CommunityPlusDashboard" },
      { label: "Profile", path: "/CommunityPlusDashboard/profile" },
      { label: "Yellow Pages", path: "/CommunityPlusDashboard/yellowpages" },
    ],
    []
  );

  /* ===============================
     ACTIVE STATE
  =============================== */
  const isActive = (path) => location.pathname === path;

  return (
    <div className="cp-dashboard">
      {/* ===============================
         HEADER
      =============================== */}
      <header className="cp-header">
        <div className="cp-logo">Community+</div>

        <nav className="cp-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`cp-nav-btn ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ===============================
         MAIN LAYOUT
      =============================== */}
      <div className="cp-main">
        {/* OPTIONAL SIDEBAR (future use) */}
        <aside className="cp-sidebar">
          <div>Filters</div>
          <div>Local Alerts</div>
        </aside>

        {/* ===============================
           CONTENT PANE (MAP LIVES HERE)
        =============================== */}
        <main className="cp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}