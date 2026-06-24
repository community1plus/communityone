import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu.jsx";

/* =========================================================
   DISPLAY NAME
========================================================= */

function getDisplayName(user) {
  if (!user) return "Guest";

  const attributes = user?.attributes || {};

  return (
    attributes?.preferred_username ||
    attributes?.name ||
    attributes?.given_name ||
    attributes?.email?.split("@")[0] ||
    user?.signInDetails?.loginId?.split("@")[0] ||
    user?.username?.replace(/^google_/, "") ||
    user?.displayName ||
    "User"
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function HeaderTopRow({ onOpenAuthModal }) {
  const navigate = useNavigate();

  const { user, isAuthenticated, isGuest } = useAuth();

  const displayName = useMemo(() => getDisplayName(user), [user]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const handleSignInClick = () => {
    if (typeof onOpenAuthModal === "function") {
      onOpenAuthModal();
      return;
    }

    navigate("/", {
      state: { openAuthModal: true },
    });
  };

  return (
    <div className="header-row">
      <div className="header-left">
        <div
          className="brand"
          onClick={() => navigate("/communityplus")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              navigate("/communityplus");
            }
          }}
        >
          <div className="brand-mark">
            <span className="brand-c"></span>
            <span className="brand-o"></span>
          </div>

          <div className="brand-wordmark">
            <span>COMMUNITY</span>
            <span>ONE</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <SearchBar />
      </div>

      <div className="header-right">
        {isGuest ? (
          <>
            <div className="guest-inline">
              <div className="guest-pill">Guest Access</div>

              <span className="guest-readonly">Read Only</span>

              <button
                type="button"
                className="guest-signin"
                onClick={handleSignInClick}
              >
                Sign In →
              </button>
            </div>

            <button
              type="button"
              className="avatar guest-avatar-button"
              onClick={handleSignInClick}
              aria-label="Sign in"
            >
              <img src="/logo/echo.png" alt="Community One" />
            </button>
          </>
        ) : isAuthenticated ? (
          <UserMenu />
        ) : (
          <button
            type="button"
            className="header-signin"
            onClick={handleSignInClick}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}