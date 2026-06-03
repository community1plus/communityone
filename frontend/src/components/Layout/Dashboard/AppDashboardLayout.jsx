import { Outlet, useLocation } from "react-router-dom";

import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function AppDashboardLayout() {
  const location = useLocation();

  const isCommunityOne =
    location.pathname.startsWith("/communityone");

  const sidebarGroup = isCommunityOne
    ? "communityone-sidebar"
    : "communityplus-sidebar";

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <CommunityPlusHeader />
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <CommunityPlusSidebar sidebarGroup={sidebarGroup} />
        </aside>

        <main className="dashboard-content">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}