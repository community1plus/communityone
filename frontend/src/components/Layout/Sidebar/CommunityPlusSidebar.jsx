import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../../../context/ProfileContext";
import { NAVIGATION } from "../../Layout/Navigation/navigationConfig";

import "./CommunityPlusSidebar.css";

const PROTECTED_PATHS = [
  "/communityplus/compose",
  "/communityplus/profile",
  "/communityplus/moderation",
  "/communityplus/account",
  "/communityplus/inbox",
  "/communityone/ses",
  "/communityone/shs",
  "/communityone/xchange",
  "/communityone/requests",
  "/communityone/responses",
  "/communityone/transactions",
  "/communityone/feature-requests",
];

function isProtectedItem(item) {
  if (!item?.path) return false;
  if (item.type === "compose") return true;

  return PROTECTED_PATHS.some((protectedPath) =>
    item.path.startsWith(protectedPath)
  );
}

export default function CommunityPlusSidebar({
  sidebarGroup = "communityplus-sidebar",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const { isAuthenticated, isGuest } = useAuth();

  const {
    profileReady,
    profileMissing,
    hasProfile,
  } = useProfile();

  const profileIsStillResolving =
    isAuthenticated &&
    !isGuest &&
    !profileReady;

  const hasMinimumProfile =
    hasProfile &&
    !profileMissing;

  const canUseProtectedActions =
    isAuthenticated &&
    !isGuest &&
    !profileIsStillResolving &&
    hasMinimumProfile;

  const sidebar = useMemo(() => {
    return (
      NAVIGATION.find((item) => item.group === sidebarGroup) || {
        group: sidebarGroup,
        sections: [],
      }
    );
  }, [sidebarGroup]);

  const sections = Array.isArray(sidebar.sections)
    ? sidebar.sections
    : [];

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

  const redirectToLogin = useCallback(
    (returnTo) => {
      navigate("/", {
        replace: false,
        state: {
          loginRequired: true,
          returnTo: returnTo || pathname,
        },
      });
    },
    [navigate, pathname]
  );

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

  const handleClick = useCallback(
    async (item) => {
      if (!item) return;

      const protectedItem = isProtectedItem(item);

      console.log("SIDEBAR AUTH STATE:", {
        isAuthenticated,
        isGuest,
        profileReady,
        profileMissing,
        hasProfile,
        profileIsStillResolving,
        hasMinimumProfile,
        itemPath: item?.path,
        protectedItem,
      });

      if (item.type === "action" && item.action === "logout") {
        if (!isAuthenticated || isGuest) {
          redirectToLogin(pathname);
          return;
        }

        await handleLogout();
        return;
      }

      if (protectedItem) {
        if (!isAuthenticated || isGuest) {
          redirectToLogin(item.path);
          return;
        }

        if (profileIsStillResolving) {
          return;
        }

        if (!hasMinimumProfile) {
          navigate("/communityplus/welcome", {
            state: {
              returnTo: item.path,
              profileRequired: true,
            },
          });
          return;
        }
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
    [
      navigate,
      pathname,
      isAuthenticated,
      isGuest,
      profileReady,
      profileMissing,
      hasProfile,
      profileIsStillResolving,
      hasMinimumProfile,
      redirectToLogin,
      handleLogout,
    ]
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
        {sections.map((section) => {
          const items = Array.isArray(section.items)
            ? section.items
            : [];

          return (
            <div
              key={section.id}
              className={`sidebar-section ${section.variant || ""}`}
            >
              <div className="sidebar-title">{section.title}</div>

              {items.map((item) => {
                const active = isActive(item);
                const protectedItem = isProtectedItem(item);

                const guestLocked =
                  protectedItem &&
                  (!isAuthenticated || isGuest);

                const profileLocked =
                  protectedItem &&
                  isAuthenticated &&
                  !isGuest &&
                  !profileIsStillResolving &&
                  !hasMinimumProfile;

                const locked =
                  guestLocked ||
                  profileLocked;

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
                      locked && "guest-locked",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleClick(item)}
                    aria-current={active ? "page" : undefined}
                    title={
                      guestLocked
                        ? "Sign in required"
                        : profileLocked
                        ? "Profile setup required"
                        : item.label
                    }
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>

                    {locked && (
                      <span className="lock" aria-hidden="true">
                        🔒
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
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