import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const isFullWidthRoute = [
    "/adtv",
    "/profile-setup",
    "/profile",
    "/yellowpages",
    "/communityplus",
    "/post",
    "/event",
    "/incident",
    "/beacon",
  ].includes(location.pathname);

  const effectiveUser = appUser?.user || appUser || user;

  return (
    <div className="app-shell">

      {/* HEADER */}
      <CommunityPlusHeader
        user={effectiveUser}
        onLogout={handleLogout}
      />

      {/* MAIN LAYOUT */}
      <div className="layout-main">

        {/* SIDEBAR */}
        <CommunityPlusSidebar />

        {/* CONTENT */}
        <div className={`layout-content ${isFullWidthRoute ? "full-width" : ""}`}>

          <div className="layout-inner">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}