import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";
import { fetchUserAttributes } from "aws-amplify/auth";

function CommunityPlusHeader({ setActiveView, user, onLogout, coords }) {

  const [location, setLocation] = useState("Locating...");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  /* ===============================
     USER DISPLAY HELPERS
  =============================== */

  const getUserName = () => {
    // Cognito typically stores this:
    const first = user?.signInDetails?.loginId?.split("@")[0] || user?.username || "User";

    // fallback clean format
    return first || "User";
  };

  const getInitials = () => {
    const name = getUserName();

    // support "first.last"
    const parts = name.split(/[.\s]/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  /* ===============================
     LOCATION RESOLUTION (FIXED)
  =============================== */

  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return;

    const cached = localStorage.getItem("userLocation");

    if (cached) {
      setLocation(cached);
      return;
    }

    const getSuburb = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );

        const data = await res.json();

        if (!data.results?.length) {
          setLocation("Location unavailable");
          return;
        }

        const components = data.results[0].address_components;

        const suburb = components.find(c =>
          c.types.includes("locality") ||
          c.types.includes("sublocality") ||
          c.types.includes("sublocality_level_1")
        );

        const state = components.find(c =>
          c.types.includes("administrative_area_level_1")
        );

        if (suburb && state) {
          const loc = `${suburb.long_name}, ${state.short_name}`;
          setLocation(loc);
          localStorage.setItem("userLocation", loc);
        } else {
          setLocation("Location unavailable");
        }

      } catch (err) {
        console.error("Geocode error:", err);
        setLocation("Location unavailable");
      }
    };

    getSuburb();
  }, [coords]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setShowMenu(prev => !prev);

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

          <span className="location-text left">
            {location || "—"}
          </span>

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

          

          {/* USER INFO + AVATAR */}
          <div className="user-block" ref={menuRef}>

            <span className="username">
              {getUserName()}
            </span>

            <div className="avatar" onClick={toggleMenu}>
              {getInitials()}
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
                    onLogout();
                    setShowMenu(false);
                  }}
                >
                  Logout
                </div>

              </div>
            )}

          </div>

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