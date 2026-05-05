import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../Navigation/navigationConfig";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname, search } = location;

  const sidebar = useMemo(() => {
    return (
      NAVIGATION.find((item) => item.group === "sidebar") || {
        group: "sidebar",
        sections: [],
      }
    );
  }, []);

  const currentMode = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("mode")?.toUpperCase() || "NOW";
  }, [search]);

  const isActive = useCallback(
    (item) => {
      if (!item?.path) return false;

      if (item.type === "mode") {
        return pathname === item.path && currentMode === item.mode;
      }

      if (item.type === "compose") {
        return pathname === item.path;
      }

      return pathname === item.path || pathname.startsWith(`${item.path}/`);
    },
    [pathname, currentMode]
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

      if (item.type === "compose" && item.path) {
        navigate(item.path, {
          state: {
            mode: item.mode,
          },
        });
        return;
      }

      if (item.type === "mode" && item.path && item.mode) {
        navigate(`${item.path}?mode=${item.mode}`, {
          state: {
            mode: item.mode,
          },
        });
        return;
      }

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
                  item.type === "mode" && "mode",
                  item.type === "compose" && "compose",
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