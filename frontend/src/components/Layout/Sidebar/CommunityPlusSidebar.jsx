import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../../../config/navigation/navigationConfig";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sidebar = useMemo(() => {
    const config = NAVIGATION.find((n) => n.group === "sidebar") || {
      sections: [],
    };

    console.log("SIDEBAR CONFIG:", config);

    return config;
  }, []);

  const isActive = useCallback(
    (item) => {
      if (!item.path) return false;

      return pathname === item.path || pathname.startsWith(item.path + "/");
    },
    [pathname]
  );

  const handleLogout = useCallback(async () => {
    console.log("LOGOUT CLICKED");

    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [navigate]);

  const handleClick = useCallback(
    async (item) => {
      console.log("SIDEBAR ITEM CLICKED:", item);

      if (!item) {
        console.warn("No sidebar item received");
        return;
      }

      if (item.type === "route") {
        if (!item.path) {
          console.warn("Route item missing path:", item);
          return;
        }

        console.log("NAVIGATING TO:", item.path);
        navigate(item.path);
        return;
      }

      if (item.type === "action") {
        console.log("ACTION TRIGGERED:", item.action);

        if (item.action === "logout") {
          await handleLogout();
          return;
        }

        console.warn("Unhandled action:", item.action);
        return;
      }

      console.warn("Unhandled sidebar item type:", item.type, item);
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
                onClick={() => {
                  console.log("BUTTON ONCLICK FIRED:", item.label);
                  handleClick(item);
                }}
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