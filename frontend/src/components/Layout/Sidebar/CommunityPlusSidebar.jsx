import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../../Layout/Navigation/navigationConfig";

import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar({
  sidebarGroup = "communityplus-sidebar",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname } = location;

  /* =======================================================
     SIDEBAR CONFIG
  ======================================================= */

  const sidebar = useMemo(() => {
    return (
      NAVIGATION.find((item) => item.group === sidebarGroup) || {
        group: sidebarGroup,
        sections: [],
      }
    );
  }, [sidebarGroup]);

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isActive = useCallback(
    (item) => {
      if (!item?.path) return false;

      return (
        pathname === item.path ||
        pathname.startsWith(`${item.path}/`)
      );
    },
    [pathname]
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = useCallback(async () => {
    try {
      await signOut();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [navigate]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleClick = useCallback(
    async (item) => {
      if (!item) return;

      if (
        item.type === "action" &&
        item.action === "logout"
      ) {
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

  /* =======================================================
     ECHO
  ======================================================= */

  const handleEchoClick = useCallback(() => {
    navigate("/communityplus/echo", {
      state: {
        source: "echo",
      },
    });
  }, [navigate]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside className="sidebar">
      <div className="sidebar-main">
        {sidebar.sections.map((section) => (
          <div
            key={section.id}
            className={`sidebar-section ${section.variant || ""}`}
          >
            <div className="sidebar-title">
              {section.title}
            </div>

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
                  <span className="icon">
                    {item.icon}
                  </span>

                  <span className="label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="echo-brand">
        <button
          type="button"
          className="echo-brand-button"
          onClick={handleEchoClick}
          aria-label="Echo"
        >
          <img
            src="/logo/echo.png"
            alt="Echo"
            className="echo-brand-image"
          />
        </button>
      </div>
    </aside>
  );
}