import { Outlet } from "react-router-dom";
import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
  return (
    <div className="dashboard-root">

      {/* ===============================
         HEADER (FULL WIDTH)
      =============================== */}
      <div className="dashboard-header">
        <CommunityPlusHeader />
      </div>

      {/* ===============================
         BODY (SIDEBAR + CONTENT)
      =============================== */}
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