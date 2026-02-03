// CommunityPlusSidebar.jsx
import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar({ setActiveView }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true }); // Return to landing page
  };
/**/ 
  return (
    <aside className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => setActiveView("news")}
      >
        ➕ Post
      </div>

      <div
        className="sidebar-item"
        onClick={() => setActiveView("event")}
      >
        ➕ Event
      </div>

      <div
        className="sidebar-item"
        onClick={() => setActiveView("incident")}
      >
        ➕ Incident
      </div>

      <div
        className="sidebar-item"
        onClick={() => setActiveView("beacon")}
      >
        ➕ Beacon
      </div>

      <hr className="sidebar-divider" />

      <div
        className="sidebar-item logout"
        onClick={handleLogout}
      >
        🚪 Logout
      </div>
    </aside>
  );
}
