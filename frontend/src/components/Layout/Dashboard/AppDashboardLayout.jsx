import { Outlet, useLocation } from "react-router-dom";
import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

export default function AppDashboardLayout() {
  const location = useLocation();

  const isCommunityOne =
    location.pathname.startsWith("/communityone");

  const sidebarGroup = isCommunityOne
    ? "communityone-sidebar"
    : "communityplus-sidebar";

  return (
    <div className="app-shell">
      <CommunityPlusHeader />

      <main className="app-main">
        <CommunityPlusSidebar sidebarGroup={sidebarGroup} />

        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}