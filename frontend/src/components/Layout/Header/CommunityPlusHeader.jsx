import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationContext"; // ✅ NEW

function CommunityPlusHeader({ setActiveView, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  /* ===============================
  📍 LOCATION CONTEXT (NEW SYSTEM)
  =============================== */

  const {
    viewLocation,
    homeLocation,
    enableLiveLocation,
    setViewLocation
  } = useLocationContext();

  /* ===============================
  👤 USERNAME (HARDENED)
  =============================== */

  const getUserName = () => {
    if (!user) return "Member";

    if (user?.attributes?.name && !/^\d+$/.test(user.attributes.name)) {
      return user.attributes.name;
    }

    const email =
      user?.attributes?.email ||
      user?.signInDetails?.loginId;

    if (email && email.includes("@")) {
      return email.split("@")[0];
    }

    return "Member"; // 🔥 hard stop (no numeric leak)
  };

  const getInitials = () => {
    const name = getUserName();
    const clean = name.replace(/[^a-zA-Z]/g, "");

    if (!clean) return "ME";
    return clean.slice(0, 2).toUpperCase();
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

  /* ===============================
  RENDER
  =============================== */

  const isAuthed = !!user;
  const username = getUserName();
  const initials = getInitials();

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

          {/* 🔥 LOCATION SWITCHER */}
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
                title={user?.attributes?.email || ""}
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