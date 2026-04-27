import { Outlet, useNavigate } from "react-router-dom";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ===============================
         HEADER / NAVIGATION
      =============================== */}

      <nav style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => navigate("/CommunityPlusDashboard")}>
          Home
        </button>

        <button onClick={() => navigate("/CommunityPlusDashboard/profile")}>
          Profile
        </button>

        <button onClick={() => navigate("/CommunityPlusDashboard/yellowpages")}>
          Yellow Pages
        </button>
      </nav>

      {/* ===============================
         PAGE CONTENT (NESTED ROUTES)
      =============================== */}

      <div style={{ marginTop: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}