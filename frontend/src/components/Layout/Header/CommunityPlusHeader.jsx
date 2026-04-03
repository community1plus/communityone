import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext"; // 🔥 NEW

function CommunityPlusHeader({ setActiveView, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    viewLocation,
    homeLocation,
    enableLiveLocation,
    setViewLocation
  } = useLocationContext();

  // 🔥 GLOBAL USER (BACKEND)
  const { appUser } = useAuth();

  // 🔥 SOURCE OF TRUTH
  const effectiveUser = appUser || user;

  /* ===============================
  👤 USERNAME (FINAL)
  =============================== */

  const getUserName = () => {
    if (!effectiveUser) return "Member";

    // ✅ 1. Backend user (BEST)
    if (effectiveUser?.email) {
      return effectiveUser.email.split("@")[0];
    }

    // ✅ 2. Amplify login
    if (effectiveUser?.signInDetails?.loginId) {
      const login = effectiveUser.signInDetails.loginId;
      if (login.includes("@")) return login.split("@")[0];
      return login;
    }

    // ✅ 3. Cognito attributes
    if (effectiveUser?.attributes?.email) {
      return effectiveUser.attributes.email.split("@")[0];
    }

    // ✅ 4. Facebook usernames (clean)
    if (effectiveUser?.username?.startsWith("facebook_")) {
      return "User";
    }

    // ✅ 5. Safe fallback
    if (effectiveUser?.username && !/^\d+$/.test(effectiveUser.username)) {
      return effectiveUser.username;
    }

    return "Member";
  };

  const getInitials = () => {
    const name = getUserName();

    if (!name || name === "User" || name === "Member") {
      return "ME";
    }

    const parts = name.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      (parts[0][0] || "") + (parts[1]?.[0] || "")
    ).toUpperCase();
  };

  /* ===============================
  CLICK OUTSIDE
  =============================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const isAuthed = !!effectiveUser;
  const username = getUserName();
  const initials = getInitials();

  /* ===============================
  RENDER
  =============================== */

  return (
    <header className="header">
      <div className="header-row">

        {/* LEFT */}
        <div className="header-left logo-container">

          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
          />

          {/* LOCATION */}
          <div className="location-switcher">
            <span className="location-text left">
              📍 {viewLocation?.label || "Locating..."}
            </span>

            <div className="location-dropdown">
              <button onClick={() => setViewLocation(homeLocation)}>
                🏠 Home
              </button>

              <button onClick={enableLiveLocation}>
                📡 Near Me
              </button>
            </div>
          </div>

        </div>

        {/* CENTER */}
        <div className="header-center">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
            />
            <span className="search-enter">⤶</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          {isAuthed && (
            <div className="user-block" ref={menuRef}>

              <span
                className="username"
                title={effectiveUser?.email || ""}
              >
                {username}
              </span>

              <div className="avatar" onClick={toggleMenu}>
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu">

                  <div
                    className="menu-item"
                    onClick={() => {
                      setActiveView("profile");
                      setShowMenu(false);
                    }}
                  >
                    Profile Settings
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => {
                      onLogout?.();
                      setShowMenu(false);
                    }}
                  >
                    Logout
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* NAV */}
      <nav className="links">
        <button onClick={() => setActiveView("dashboard")}>Home</button>
        <button onClick={() => setActiveView("posts")}>Posts</button>
        <button onClick={() => setActiveView("events")}>Events</button>
        <button onClick={() => setActiveView("incidents")}>Incidents</button>
        <button onClick={() => setActiveView("search")}>Search</button>
        <button onClick={() => setActiveView("communityplus")}>Community+</button>
        <button onClick={() => setActiveView("about")}>About</button>
        <button onClick={() => setActiveView("yellowpages")}>Yellow Pages</button>
        <button onClick={() => setActiveView("merch")}>Merch</button>
      </nav>
    </header>
  );
}

export default CommunityPlusHeader;