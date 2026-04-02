import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, onLogout, coords }) {
  const [location, setLocation] = useState("Locating...");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  /* ===============================
  🔥 USER HELPERS (FIXED)
  =============================== */

  const getUserName = () => {
    if (!user) return "";

    const email =
      user?.attributes?.email ||
      user?.signInDetails?.loginId ||
      "";

    if (email.includes("@")) {
      return email.split("@")[0]; // ✅ email prefix
    }

    return email || "User";
  };

  const getInitials = () => {
    const name = getUserName();
    if (!name) return "";

    const parts = name
      .replace(/[^a-zA-Z]/g, " ")
      .split(" ")
      .filter(Boolean);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  /* ===============================
  📍 LOCATION (PRODUCTION SAFE)
  =============================== */

  useEffect(() => {
    const getLocation = async () => {
      // ✅ 1. Try cache first
      try {
        const cached = JSON.parse(localStorage.getItem("userLocation"));
        if (
          cached &&
          cached.timestamp &&
          Date.now() - cached.timestamp < 1000 * 60 * 30
        ) {
          setLocation(cached.value);
          return;
        }
      } catch {}

      // ✅ 2. Try GPS reverse geocode
      if (coords?.lat && coords?.lng) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );

          const data = await res.json();

          const components = data.results?.[0]?.address_components || [];

          const suburb = components.find((c) =>
            ["locality", "sublocality", "sublocality_level_1"].some((t) =>
              c.types.includes(t)
            )
          );

          const state = components.find((c) =>
            c.types.includes("administrative_area_level_1")
          );

          if (suburb && state) {
            const loc = `${suburb.long_name}, ${state.short_name}`;

            setLocation(loc);

            localStorage.setItem(
              "userLocation",
              JSON.stringify({
                value: loc,
                timestamp: Date.now(),
              })
            );

            return;
          }
        } catch {}
      }

      // ✅ 3. Fallback to IP location (works in production)
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data.city && data.region_code) {
          setLocation(`${data.city}, ${data.region_code}`);
        } else {
          setLocation("Location unavailable");
        }
      } catch {
        setLocation("Location unavailable");
      }
    };

    getLocation();
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

          <span className="location-text left">
            {location}
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