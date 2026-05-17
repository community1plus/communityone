import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { NAVIGATION } from "../../../config/navigation/navigationConfig";

import "./CommunityPlusSidebar.css";

export default function CommunityPlusSidebar() {

  const navigate = useNavigate();

  const location = useLocation();

  const { pathname } = location;

  /* =======================================================
     SIDEBAR CONFIG
  ======================================================= */

  const sidebar = useMemo(() => {

    return (
      NAVIGATION.find(
        (item) => item.group === "sidebar"
      ) || {
        group: "sidebar",
        sections: [],
      }
    );

  }, []);

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isActive = useCallback(
    (item) => {

      if (!item?.path) return false;

      return pathname === item.path;

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
      
    }

  }, [navigate]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleClick = useCallback(
    async (item) => {

      if (!item) return;

      /* LOGOUT */

      if (
        item.type === "action" &&
        item.action === "logout"
      ) {
        await handleLogout();
        return;
      }

      /* ROUTES */

      if (item.path) {

        navigate(item.path, {
          state:
            item.type === "compose"
              ? {
                  mode:
                    item.mode || "now",

                  composerType:
                    item.mode || "now",
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

      {/* ===================================================
          MAIN
      ==================================================== */}

      <div className="sidebar-main">

        {sidebar.sections.map((section) => (

          <div
            key={section.id}
            className={`sidebar-section ${
              section.variant || ""
            }`}
          >

            <div className="sidebar-title">
              {section.title}
            </div>

            {section.items.map((item) => {

              const active =
                isActive(item);

              return (

                <button
                  key={item.id}
                  type="button"
                  className={[
                    "sidebar-link",

                    active && "active",

                    item.type === "compose" &&
                      "compose",

                    item.type === "route" &&
                      "route",

                    item.type === "action" &&
                      "action",

                    item.action === "logout" &&
                      "logout",
                  ]
                    .filter(Boolean)
                    .join(" ")}

                  onClick={() =>
                    handleClick(item)
                  }

                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
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

      {/* ===================================================
          ECHO ORB
      ==================================================== */}

      <button
        type="button"
        className="echo-orb"
        onClick={handleEchoClick}
        aria-label="Echo"
      >

        {/* PULSE */}

        <span className="echo-orb-pulse" />

        {/* CORE */}

        <span className="echo-orb-core">

          <span className="echo-orb-icon">
            ✦
          </span>

        </span>

      </button>

    </aside>

  );

}