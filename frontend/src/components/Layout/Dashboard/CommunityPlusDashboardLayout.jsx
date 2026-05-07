import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}