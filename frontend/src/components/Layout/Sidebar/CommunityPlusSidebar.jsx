import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NAVIGATION } from "../../../config/navigation";
import { useMap } from "../../context/MapContext";

import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* =========================
     GLOBAL STATE
  ========================= */

  const { mode, setMode, scope, setScope } = useMap();

  /* =========================
     NAV CONFIG
  ========================= */

  const sidebar = useMemo(
    () => NAVIGATION.find((n) => n.group === "sidebar") || { sections: [] },
    []
  );

  /* =========================
     HELPERS
  ========================= */

  const goToFeed = useCallback(() => {
    if (pathname !== "/communityplus") {
      navigate("/communityplus");
    }
  }, [pathname, navigate]);

  const isActive = useCallback(
    (item) => {
      switch (item.type) {
        case "route":
          return (
            item.path &&
            (pathname === item.path ||
              pathname.startsWith(item.path + "/"))
          );

        case "mode":
          return item.value === mode;

        case "scope":
          return item.value === scope;

        default:
          return false;
      }
    },
    [pathname, mode, scope]
  );

  /* =========================
     CLICK HANDLER
  ========================= */

  const handleClick = useCallback(
    (item) => {
      switch (item.type) {
        case "route":
          item.path && navigate(item.path);
          return;

        case "action":
          if (item.action === "logout") {
            console.log("logout");
          }
          return;

        case "mode":
          setMode(item.value);
          goToFeed();
          return;

        case "scope":
          setScope(item.value);
          goToFeed();
          return;

        default:
          return;
      }
    },
    [navigate, setMode, setScope, goToFeed]
  );

  /* =========================
     RENDER
  ========================= */

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