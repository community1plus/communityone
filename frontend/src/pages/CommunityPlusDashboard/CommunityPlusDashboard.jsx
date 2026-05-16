import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="cp-header">
        <button
          type="button"
          className="cp-logo-button"
          onClick={() => navigate("/communityplus")}
        >
          COMMUNITY+
        </button>

        <nav className="cp-header-nav" aria-label="Main navigation">
          <button
            type="button"
            className={isActive("/communityplus") ? "active" : ""}
            onClick={() => navigate("/communityplus")}
          >
            Home
          </button>

          <button
            type="button"
            className={isActive("/communityplus/profile") ? "active" : ""}
            onClick={() => navigate("/communityplus/profile")}
          >
            Profile
          </button>
        </nav>
      </header>

      {/* MAIN */}
      <div className="layout-main">
        {/* SIDEBAR */}
        <aside className="layout-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">iVIEW</div>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/compose/now")}
            >
              <span>⚡</span>
              <strong>NOW</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/compose/blob")}
            >
              <span>🧠</span>
              <strong>BLOB</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/compose/news")}
            >
              <span>📰</span>
              <strong>News</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/events/create")}
            >
              <span>📅</span>
              <strong>Events</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/compose/beacon")}
            >
              <span>📡</span>
              <strong>Beacon</strong>
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">PLATFORM</div>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/yellowpages")}
            >
              <span>📒</span>
              <strong>Yellow Pages</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/channels")}
            >
              <span>📺</span>
              <strong>Channels</strong>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => navigate("/communityplus/help")}
            >
              <span>🛠️</span>
              <strong>Helpdesk</strong>
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="layout-content">
          <div className="layout-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}