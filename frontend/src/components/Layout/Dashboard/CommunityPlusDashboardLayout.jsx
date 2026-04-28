import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function CommunityPlusDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="dashboard-root">
      
      {/* ===============================
         SIDEBAR
      =============================== */}
      <aside className="dashboard-sidebar">
        <h2>Community One</h2>

        <button
          onClick={() => navigate("/CommunityPlusDashboard")}
          className={isActive("/CommunityPlusDashboard") ? "active" : ""}
        >
          Home
        </button>

        <button
          onClick={() => navigate("/CommunityPlusDashboard/profile")}
          className={isActive("profile") ? "active" : ""}
        >
          Profile
        </button>

        <button
          onClick={() =>
            navigate("/CommunityPlusDashboard/yellowpages")
          }
          className={isActive("yellowpages") ? "active" : ""}
        >
          Yellow Pages
        </button>
      </aside>

      {/* ===============================
         MAIN AREA
      =============================== */}
      <div className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">
          <h3>Dashboard</h3>
        </header>

        {/* CONTENT */}
        <div className="dashboard-content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}