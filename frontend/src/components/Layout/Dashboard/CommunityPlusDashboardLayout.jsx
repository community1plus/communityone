import { Outlet, useLocation } from "react-router-dom";

import Header from "../Header/Header";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
  const location = useLocation();

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <Header />
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <CommunityPlusSidebar />
        </aside>

        <main className="dashboard-content">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}