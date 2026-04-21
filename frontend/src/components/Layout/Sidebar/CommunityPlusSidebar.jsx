import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const go = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {/* ===============================
          CORE MODES
      =============================== */}

      <div
        className={`sidebar-item ${isActive("/now") ? "active" : ""}`}
        onClick={() => go("/now")}
      >
        ⚡ Now
      </div>

      <div
        className={`sidebar-item ${isActive("/blob") ? "active" : ""}`}
        onClick={() => go("/blob")}
      >
        🧠 Blob
      </div>

      <hr className="sidebar-divider" />

      {/* ===============================
          ACTIONS
      =============================== */}

      <div
        className={`sidebar-item ${isActive("/event") ? "active" : ""}`}
        onClick={() => go("/event")}
      >
        📅 Event
      </div>

      <div
        className={`sidebar-item ${isActive("/incident") ? "active" : ""}`}
        onClick={() => go("/incident")}
      >
        🚨 Incident
      </div>

      <div
        className={`sidebar-item ${isActive("/beacon") ? "active" : ""}`}
        onClick={() => go("/beacon")}
      >
        📡 Beacon
      </div>

      <hr className="sidebar-divider" />

      {/* ===============================
          SESSION
      =============================== */}

      <div className="sidebar-item logout" onClick={handleLogout}>
        🚪 Logout
      </div>

    </aside>
  );
}