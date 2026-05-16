import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../../../config/navigation/navigationConfig";
import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname } = location;

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

      /*
        Exact matching prevents:
        /communityplus/events
        from staying active when user is on:
        /communityplus/events/create
      */
      return pathname === item.path;
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

      if (item.type === "action" && item.action === "logout") {
        await handleLogout();
        return;
      }

      if (item.path) {
        navigate(item.path, {
          state:
            item.type === "compose"
              ? {
                  mode: item.mode || "now",
                  composerType: item.mode || "now",
                }
              : undefined,
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
  console.log("SIDEBAR NAV", sidebar);
}