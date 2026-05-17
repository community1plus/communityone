import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../../context/AuthContext";

import SearchBar from "./SearchBar";

import UserMenu from "./UserMenu.jsx";

/* =========================================================
   DISPLAY NAME
========================================================= */

function getDisplayName(user) {
  if (!user) return "Guest";

  const attributes =
    user?.attributes || {};

  return (
    attributes?.preferred_username ||
    attributes?.name ||
    attributes?.given_name ||
    attributes?.email?.split(
      "@"
    )[0] ||
    user?.signInDetails?.loginId?.split(
      "@"
    )[0] ||
    user?.username?.replace(
      /^google_/,
      ""
    ) ||
    user?.displayName ||
    "User"
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name = ""
) {
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

export default function HeaderTopRow() {
  const navigate =
    useNavigate();

  const {
    user,
    isAuthenticated,
    isGuest,
  } = useAuth();

  /* ======================================================
     USER DISPLAY
  ====================================================== */

  const displayName =
    useMemo(
      () =>
        getDisplayName(user),
      [user]
    );

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName
        ),
      [displayName]
    );

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="header-row">
      {/* ============================================
          LEFT
      ============================================ */}

      <div className="header-left">
        <div
          className="brand"
          onClick={() =>
            navigate(
              "/communityplus"
            )
          }
          role="button"
          tabIndex={0}
        >
          {/* LOGO */}

          <div className="brand-mark">
            <span className="brand-c"></span>

            <span className="brand-o"></span>
          </div>

          {/* WORDMARK */}

          <div className="brand-wordmark">
            <span>
              COMMUNITY
            </span>

            <span>
              ONE
            </span>
          </div>
        </div>
      </div>

      {/* ============================================
          CENTER
      ============================================ */}

      <div className="header-center">
        <SearchBar />
      </div>

      {/* ============================================
          RIGHT
      ============================================ */}

      <div className="header-right">
  {isGuest ? (
    <>
      <div className="guest-badge-stack">
        <div className="guest-pill">
          Guest Access
        </div>

        <div className="guest-readonly">
          Read Only
        </div>

        <button
          type="button"
          className="guest-signin"
          onClick={() => navigate("/")}
        >
          Sign In →
        </button>
      </div>

      <div className="header-avatar">
        <img
          src="/logo/echo.png"
          alt="Community One"
        />
      </div>
    </>
  ) : isAuthenticated ? (
    <UserMenu />
  ) : (
    <button
      type="button"
      className="header-signin"
      onClick={() => navigate("/")}
    >
      Sign In
    </button>
  )}
</div>
        ) : (
          /* ====================================
              ANONYMOUS
          ==================================== */

          <button
            type="button"
            className="header-signin"
            onClick={() =>
              navigate("/")
            }
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}