import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationContext";

function CommunityPlusHeader({ setActiveView, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    viewLocation,
    homeLocation,
    enableLiveLocation,
    setViewLocation
  } = useLocationContext();

  /* ===============================
  👤 USERNAME (FIXED)
  =============================== */

  const getUserName = () => {
    if (!user) return "Member";

    // 🔍 Debug once if needed
    // console.log("USER OBJECT:", user);

    // ✅ 1. Amplify v6 (BEST SOURCE)
    const emailFromSignIn = user?.signInDetails?.loginId;
    if (emailFromSignIn && emailFromSignIn.includes("@")) {
      return emailFromSignIn.split("@")[0];
    }

    // ✅ 2. Cognito attributes
    if (user?.attributes?.email) {
      return user.attributes.email.split("@")[0];
    }

    // ✅ 3. Display name (if exists)
    if (user?.attributes?.name && !/^\d+$/.test(user.attributes.name)) {
      return user.attributes.name;
    }

    // ✅ 4. Username fallback (avoid numeric junk)
    if (user?.username && !/^\d+$/.test(user.username)) {
      return user.username;
    }

    return "Member";
  };

  const getInitials = () => {
    const name = getUserName();

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

  const isAuthed = !!user;
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
                title={
                  user?.attributes?.email ||
                  user?.signInDetails?.loginId ||
                  ""
                }
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

      <nav className="links">
        <button onClick={() => setActiveView("dashboard")}>Home</button>
        <button onClick={() => setActiveView("posts")}>Posts</button>
        <button onClick={() => setActiveView("events")}>Events</button>
        <button onClick={() => setActiveView("incidents")}>Incidents</button>
        <button onClick={() => setActiveView("search")}>Search</button>
        <button onClick={() => setActiveView("community")}>Community+</button>
        <button onClick={() => setActiveView("about")}>About</button>
        <button onClick={() => setActiveView("yellowpages")}>Yellow Pages</button>
        <button onClick={() => setActiveView("merch")}>Merch</button>
      </nav>
    </header>
  );
}

export default CommunityPlusHeader;