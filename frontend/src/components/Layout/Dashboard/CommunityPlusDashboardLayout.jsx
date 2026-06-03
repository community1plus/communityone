import { Outlet, useLocation } from "react-router-dom";

import Header from "../Header/Header";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
  const location = useLocation();

  const isCommunityOne =
    location.pathname.startsWith("/communityone");

  const sidebarGroup = isCommunityOne
    ? "communityone-sidebar"
    : "communityplus-sidebar";

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <Header />
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