import React, { useState, useEffect, useRef, useMemo } from "react";
import "./CommunityPlusHeader.css";
import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext";

function CommunityPlusHeader({ setActiveView, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const [locating, setLocating] = useState(false);
  const menuRef = useRef(null);

  const {
    viewLocation,
    homeLocation,
    enableLiveLocation,
    enableHomeLocation,
    setViewLocation
  } = useLocationContext();

  const { appUser } = useAuth();
  const effectiveUser = appUser || user;

  /* ===============================
     🧠 USER LOGIC (CLEANED)
  =============================== */

  const username = useMemo(() => {
    if (!effectiveUser) return "Member";

    const email =
      effectiveUser?.email ||
      effectiveUser?.attributes?.email ||
      effectiveUser?.signInDetails?.loginId;

    if (email && email.includes("@")) {
      return email.split("@")[0];
    }

    if (effectiveUser?.username && !/^\d+$/.test(effectiveUser.username)) {
      return effectiveUser.username;
    }

    return "Member";
  }, [effectiveUser]);

  const initials = useMemo(() => {
    if (!username) return "ME";

    const parts = username.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return ((parts[0][0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }, [username]);

  /* ===============================
     📍 LOCATION FORMATTER
  =============================== */

  const formatLocationLabel = (loc) => {
    if (!loc) return "Locating...";

    const stateMap = {
      Victoria: "VIC",
      "New South Wales": "NSW",
      Queensland: "QLD",
      "South Australia": "SA",
      Tasmania: "TAS",
      "Western Australia": "WA",
      "Northern Territory": "NT",
      ACT: "ACT"
    };

    const stateShort = stateMap[loc.state] || loc.state;

    return `${loc.suburb || loc.city || ""}, ${stateShort || ""} ${loc.postcode || ""}`.trim();
  };

  /* ===============================
     🎯 ACCURACY INTELLIGENCE
  =============================== */

  const accuracyMeta = useMemo(() => {
    const acc = viewLocation?.accuracy;
    if (!acc) return null;

    if (acc <= 50) return { label: "Exact", class: "exact" };
    if (acc <= 200) return { label: "Precise", class: "precise" };
    if (acc <= 1000) return { label: "Approx", class: "approx" };

    return { label: "Rough", class: "rough" };
  }, [viewLocation]);

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
     📡 LOCATION ACTIONS (UPGRADED)
  =============================== */

  const handleHomeClick = async () => {
    if (locating) return;
    setLocating(true);

    try {
      // Refresh only if stale or missing
      if (!homeLocation || homeLocation?.accuracy > 500) {
        await enableHomeLocation();
      } else {
        setViewLocation(homeLocation);
      }
    } finally {
      setLocating(false);
    }
  };

  const handleLiveClick = async () => {
    if (locating) return;
    setLocating(true);

    try {
      await enableLiveLocation();
    } finally {
      setLocating(false);
    }
  };

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

            <div className="location-display">

              <span className="location-text">
                📍 {locating
                  ? "Locating..."
                  : formatLocationLabel(viewLocation)}
              </span>

              {!locating && viewLocation?.accuracy && (
                <>
                  <span className="location-accuracy">
                    ±{Math.round(viewLocation.accuracy)}m
                  </span>

                  {accuracyMeta && (
                    <span className={`location-badge ${accuracyMeta.class}`}>
                      {accuracyMeta.label}
                    </span>
                  )}
                </>
              )}

            </div>

            <div className="location-dropdown">
              <button onClick={handleHomeClick}>
                🏠 Home
              </button>

              <button onClick={handleLiveClick}>
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
          {effectiveUser && (
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