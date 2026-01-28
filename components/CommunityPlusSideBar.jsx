import React, { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import CommunityPlusUploadForm from "./CommunityPlusUploadForm";

export default function CommunityPlusSidebar({ setActiveView }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/"); // 👈 redirect to landing page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <li className="sidebar-item" onClick={() => setShowModal(true)}>
          ➕ Add News
        </li>
        <li className="sidebar-item" onClick={() => setActiveView("events")}>
          📅 Add Event
        </li>
        <li className="sidebar-item" onClick={() => setActiveView("posts")}>
          💬 Opinion
        </li>

        <hr className="sidebar-divider" />

        <li className="sidebar-item logout" onClick={handleLogout}>
          🚪 Logout
        </li>
      </aside>

      {/* modal... remains unchanged */}
    </>
  );
}
