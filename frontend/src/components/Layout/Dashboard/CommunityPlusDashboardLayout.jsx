import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function CommunityPlusDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.includes(path);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* ===============================
         SIDEBAR
      =============================== */}
      <aside
        style={{
          width: "240px",
          background: "#111",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2>Community One</h2>

        <button
          onClick={() => navigate("/CommunityPlusDashboard")}
          style={{
            background: isActive("/CommunityPlusDashboard") ? "#333" : "none",
            color: "#fff",
          }}
        >
          Home
        </button>

        <button
          onClick={() => navigate("/CommunityPlusDashboard/profile")}
          style={{
            background: isActive("profile") ? "#333" : "none",
            color: "#fff",
          }}
        >
          Profile
        </button>

        <button
          onClick={() =>
            navigate("/CommunityPlusDashboard/yellowpages")
          }
          style={{
            background: isActive("yellowpages") ? "#333" : "none",
            color: "#fff",
          }}
        >
          Yellow Pages
        </button>
      </aside>

      {/* ===============================
         MAIN CONTENT
      =============================== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <header
          style={{
            height: "60px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <h3>Dashboard</h3>
        </header>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, position: "relative" }}>
          
          {/* 🔥 MAP (PERSISTENT) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          >
            {/* Replace with your actual map component */}
            <div style={{ height: "100%", background: "#e5e5e5" }}>
              🗺️ Map goes here
            </div>
          </div>

          {/* 🔥 NESTED ROUTES */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}