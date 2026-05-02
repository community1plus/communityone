import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sidebar = useMemo(
    () => NAVIGATION.find((n) => n.group === "sidebar") || { sections: [] },
    []
  );

  const isActive = useCallback(
    (item) => {
      if (!item.path) return false;

      return pathname === item.path || pathname.startsWith(item.path + "/");
    },
    [pathname]
  );

  const handleClick = useCallback(
    (item) => {
      switch (item.type) {
        case "route":
          if (item.path) {
            navigate(item.path);
          }
          return;

        case "action":
          if (item.action === "logout") {
            console.log("logout");
          }
          return;

        default:
          return;
      }
    },
    [navigate]
  );

  return (
    <aside className="sidebar">
      {sidebar.sections.map((section) => (
        <div
          key={section.id}
          className={`sidebar-section ${section.variant || ""}`}
        >
          <div className="sidebar-title">{section.title}</div>

          {section.items.map((item) => {
            const active = isActive(item);

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  "sidebar-link",
                  active && "active",
                  item.type === "action" && "action",
                  item.action === "logout" && "logout",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleClick(item)}
                aria-current={active ? "page" : undefined}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}