import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
  return (
    <div className="dashboard-root">

      {/* ================= HEADER ================= */}
      <header className="dashboard-header">
        <Header />
      </header>

      {/* ================= BODY ================= */}
      <div className="dashboard-body">

        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
          <CommunityPlusSidebar />
        </aside>

        {/* CONTENT */}
        <main className="dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}