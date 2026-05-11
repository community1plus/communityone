import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu.jsx";

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
    "User"
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function HeaderTopRow() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const displayName = useMemo(
    () => getDisplayName(user),
    [user]
  );

  const initials = useMemo(
    () => getInitials(displayName),
    [displayName]
  );

  return (
    <div className="header-row">
      <div className="header-left">
        <div
          className="brand"
          onClick={() => navigate("/communityplus")}
          role="button"
          tabIndex={0}
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
        {isAuthenticated ? (
          <div className="header-user">
            <div className="header-username">
              {displayName}
            </div>

            <button className="avatar" type="button">
                <img src="/logo/echo.png" alt="Community One" />
            </button>

            <UserMenu />
          </div>
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
    </div>
  );
}