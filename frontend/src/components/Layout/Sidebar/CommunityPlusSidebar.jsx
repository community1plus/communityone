import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../../../config/navigation/navigationConfig";
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
    return params.get("mode") || "";
  }, [search]);

  const isActive = useCallback(
    (item) => {
      if (!item?.path) return false;

      if (item.type === "compose") {
        return pathname === item.path;
      }

      if (item.type === "mode") {
        return pathname === item.path && currentMode === item.mode;
      }

      if (item.type === "route") {
        return pathname === item.path;
      }

      return false;
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

      if (item.type === "action" && item.action === "logout") {
        await handleLogout();
        return;
      }

      if (item.type === "route" && item.path) {
        navigate(item.path);
        return;
      }

      if (item.type === "compose" && item.path) {
        navigate(item.path, {
          state: {
            mode: item.mode || "now",
            composerType: item.mode || "now",
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
      }
    },
    [navigate, handleLogout]
  );

  const handleEchoClick = useCallback(() => {
    navigate("/communityplus/echo", {
      state: {
        source: "echo",
      },
    });
  }, [navigate]);

  return (
    <aside className="sidebar">
      <div className="sidebar-main">
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
                    item.type === "route" && "route",
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
      </div>

      <button
        type="button"
        className="echo-sidebar-signal"
        onClick={handleEchoClick}
        aria-label="echo"
      >
        <span className="echo-tooltip">echo</span>

        <span className="echo-sidebar-mark">+</span>

        <span className="echo-sidebar-meta">
          <span className="echo-sidebar-name">echo</span>
          <span className="echo-sidebar-status">signal active</span>
        </span>
      </button>
    </aside>
  );
}