// CommunityPlusSidebar.jsx
import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import "../../src/components/Sidebar/CommunityPlusSidebar.css";

export default function CommunityPlusSidebar({ setActiveView }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true }); // Return to landing page
  };

  return (
    <aside className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => setActiveView("news")}
      >
        ➕ Add News
      </div>

      <div
        className="sidebar-item"
        onClick={() => setActiveView("event")}
      >
        📅 Add Event
      </div>

      <div
        className="sidebar-item"
        onClick={() => setActiveView("opinion")}
      >
        💬 Opinion
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
