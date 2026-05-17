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
        {/* ========================================
            AUTHENTICATED USER
        ======================================== */}

        {isAuthenticated ? (
          <div className="header-user">
            <UserMenu />
          </div>
        ) : isGuest ? (
          /* ====================================
              GUEST MODE
          ==================================== */

          <div className="guest-badge-wrapper">
            <div className="guest-badge">
              <span className="guest-dot" />

              <span className="guest-label">
                Guest Mode
              </span>
            </div>

            <button
              type="button"
              className="guest-signin-button"
              onClick={() =>
                navigate("/")
              }
            >
              Sign In
            </button>
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