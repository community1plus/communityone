import { useNavigate, useLocation } from "react-router-dom";
import { NAVIGATION } from "../Navigation/navigationConfig"; // 🔥 adjust path if needed
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebar = NAVIGATION.find((n) => n.group === "sidebar");

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {sidebar.sections.map((section) => (
        <div key={section.title} className="sidebar-section">

          <div className="sidebar-title">{section.title}</div>

          {section.items.map((item) => {
            const active = item.path && isActive(item.path);

            return (
              <button
                key={item.label}
                className={`sidebar-link ${active ? "active" : ""} ${
                  item.action === "logout" ? "logout" : ""
                }`}
                onClick={() => {
                  if (item.action === "logout") {
                    // 🔥 plug your logout here
                    console.log("logout");
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

        </div>
      ))}

    </aside>
  );
}