import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../Navigation/navigationConfig";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sidebar = useMemo(() => {
    return (
      NAVIGATION.find((item) => item.group === "sidebar") || {
        group: "sidebar",
        sections: [],
      }
    );
  }, []);

  const isActive = useCallback(
    (item) => {
      if (!item?.path) return false;
      return pathname === item.path || pathname.startsWith(`${item.path}/`);
    },
    [pathname]
  );

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [navigate]);

  const handleClick = useCallback(
    async (item) => {
      if (!item) return;

      if (item.type === "route" && item.path) {
        navigate(item.path);
        return;
      }

      if (item.type === "action" && item.action === "logout") {
        await handleLogout();
      }
    },
    [navigate, handleLogout]
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