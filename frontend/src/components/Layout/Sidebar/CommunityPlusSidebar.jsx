import { useNavigate, useLocation } from "react-router-dom";
import { NAVIGATION } from "../Navigation/navigationConfig";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebar = NAVIGATION.find((n) => n.group === "sidebar");

  /* =========================
     HELPERS
  ========================= */

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path); // 🔥 better matching
  };

  const handleClick = (item) => {
    if (item.action === "logout") {
      // 🔥 plug real logout here
      console.log("logout");
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <aside className="sidebar">

      {sidebar.sections.map((section) => (
        <div
          key={section.title}
          className={`sidebar-section ${section.variant || ""}`}
        >
          {/* TITLE */}
          <div className="sidebar-title">
            {section.title}
          </div>

          {/* ITEMS */}
          {section.items.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.label}
                className={`sidebar-link 
                  ${active ? "active" : ""} 
                  ${item.action === "logout" ? "logout" : ""}
                `}
                onClick={() => handleClick(item)}
                data-label={item.label} // 🔥 tooltip support
                aria-current={active ? "page" : undefined}
              >
                {/* ICON */}
                <span className="icon">
                  {item.icon}
                </span>

                {/* LABEL */}
                <span className="label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}

    </aside>
  );
}