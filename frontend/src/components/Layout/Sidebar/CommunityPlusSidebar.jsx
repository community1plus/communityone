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
    <aside className="sidebar panel">

      {/* ===============================
          CORE MODES
      =============================== */}

      <div className="sidebar-group">
        <div className="meta">Modes</div>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/now") ? "active" : ""}`}
          onClick={() => go("/now")}
        >
          ⚡ <span className="label">Now</span>
        </button>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/blob") ? "active" : ""}`}
          onClick={() => go("/blob")}
        >
          🧠 <span className="label">Blob</span>
        </button>
      </div>

      <hr className="sidebar-divider" />

      {/* ===============================
          ACTIONS
      =============================== */}

      <div className="sidebar-group">
        <div className="meta">Actions</div>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/event") ? "active" : ""}`}
          onClick={() => go("/event")}
        >
          📅 Event
        </button>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/incident") ? "active" : ""}`}
          onClick={() => go("/incident")}
        >
          🚨 Incident
        </button>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/beacon") ? "active" : ""}`}
          onClick={() => go("/beacon")}
        >
          📡 Beacon
        </button>
      </div>

      <hr className="sidebar-divider" />

      {/* ===============================
          AD.TV
      =============================== */}

      <div className="sidebar-group">
        <div className="meta">Media</div>

        <button
          className={`btn btn-ghost sidebar-btn ${isActive("/adtv") ? "active" : ""}`}
          onClick={() => go("/adtv")}
        >
         <div className="adtv-logo">
             📺 AD.TV 
          </div>
        </button>
      </div>

      <hr className="sidebar-divider" />

      {/* ===============================
          SESSION
      =============================== */}

      <div className="sidebar-group">
        <button
          className="btn btn-ghost sidebar-btn logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>

    </aside>
  );
}