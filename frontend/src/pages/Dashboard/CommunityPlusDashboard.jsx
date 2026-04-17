import React from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";

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
    "/profile-setup",
    "/profile",
    "/yellowpages",
    "/communityplus",
    "/post",
    "/event",
    "/incident",
    "/beacon",
  ].includes(location.pathname);

  return (
    <div className="dashboard-container">
      <CommunityPlusHeader
        user={appUser?.user || appUser || user}
        onLogout={handleLogout}
      />

      <main className="main">
        <CommunityPlusSidebar />

        <div className={`content-area ${isFullWidthRoute ? "full-width" : ""}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}