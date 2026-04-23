import { useNavigate, useLocation } from "react-router-dom";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {/* =========================
         MODES
      ========================= */}
      <div className="sidebar-section">
        <div className="sidebar-title">MODES</div>

        <div className="sidebar-item">⚡ NOW</div>
        <div className="sidebar-item">🧠 BLOB</div>
      </div>

      {/* =========================
         ACTIONS (USER COMMANDS)
      ========================= */}
      <div className="sidebar-section">
        <div className="sidebar-title">ACTIONS</div>

        <button
          className="sidebar-link"
          onClick={() => navigate("/event")}
        >
          📅 Event
        </button>

        <button
          className="sidebar-link"
          onClick={() => navigate("/incident")}
        >
          🚨 Incident
        </button>

        <button
          className="sidebar-link"
          onClick={() => navigate("/beacon")}
        >
          📡 Beacon
        </button>
      </div>

      {/* =========================
         PLATFORM (SURFACES)
      ========================= */}
      <div className="sidebar-section">
        <div className="sidebar-title">PLATFORM</div>

        <button
          className={`sidebar-link ${isActive("/communityplus") ? "active" : ""}`}
          onClick={() => navigate("/communityplus")}
        >
          🌐 Community+
        </button>

        <button
          className={`sidebar-link ${isActive("/yellowpages") ? "active" : ""}`}
          onClick={() => navigate("/yellowpages")}
        >
          📒 Yellow Pages
        </button>

        <button
          className={`sidebar-link ${isActive("/channels") ? "active" : ""}`}
          onClick={() => navigate("/channels")}
        >
          📺 Channels
        </button>
      </div>

      {/* =========================
         ACCOUNT
      ========================= */}
      <div className="sidebar-section">
        <div className="sidebar-title">ACCOUNT</div>

        <button
          className="sidebar-link"
          onClick={() => navigate("/profile")}
        >
          👤 Profile
        </button>

        <button className="sidebar-link logout">
          🚪 Logout
        </button>
      </div>

    </aside>
  );
}