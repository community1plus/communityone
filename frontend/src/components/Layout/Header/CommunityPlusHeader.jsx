import React, { useState, useEffect, useRef } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, onLogout, coords }) {
  const [location, setLocation] = useState("Locating...");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  /* ===============================
  👤 USERNAME (HARDENED)
  =============================== */

  const getUserName = () => {
    if (!user) return "Member";

    // ✅ 1. Real name (best)
    if (user?.attributes?.name && !/^\d+$/.test(user.attributes.name)) {
      return user.attributes.name;
    }

    // ✅ 2. Email
    const email =
      user?.attributes?.email ||
      user?.signInDetails?.loginId;

    if (email && email.includes("@")) {
      return email.split("@")[0];
    }

    // ❌ 3. BLOCK numeric IDs completely
    const raw = user?.username || "";

    if (!raw || /^\d+$/.test(raw)) {
      return "Member";
    }

    // ✅ 4. Clean provider strings
    return raw.replace(/^facebook_|^google_/, "");
  };

  const getInitials = () => {
    const name = getUserName();

    const clean = name.replace(/[^a-zA-Z]/g, "");

    if (!clean) return "ME";

    if (clean.length === 1) return clean.toUpperCase();

    return clean.slice(0, 2).toUpperCase();
  };

  /* ===============================
  📍 LOCATION (FORCED RESOLUTION)
  =============================== */

  useEffect(() => {
    let mounted = true;

    const resolveLocation = async () => {
      // ✅ STEP 1: ALWAYS get IP location first (fast + reliable)
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (mounted && data.city && data.region_code) {
          setLocation(`${data.city}, ${data.region_code}`);
        }
      } catch {
        if (mounted) setLocation("Location unavailable");
      }

      // ✅ STEP 2: Upgrade to precise GPS location if available
      if (coords?.lat && coords?.lng) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );

          const data = await res.json();
          const best = data.results?.[0];

          if (!best) return;

          const components = best.address_components || [];

          const suburb =
            components.find(c => c.types.includes("sublocality_level_1")) ||
            components.find(c => c.types.includes("neighborhood")) ||
            components.find(c => c.types.includes("postal_town"));

          const city = components.find(c =>
            c.types.includes("locality")
          );

          const state = components.find(c =>
            c.types.includes("administrative_area_level_1")
          );

          const postcode = components.find(c =>
            c.types.includes("postal_code")
          );

          let loc = "";

          if (suburb && state) {
            loc = `${suburb.long_name}, ${state.short_name} ${postcode?.long_name || ""}`;
          } else if (city && state) {
            loc = `${city.long_name}, ${state.short_name}`;
          }

          if (mounted && loc) {
            setLocation(loc.trim());
          }
        } catch {}
      }
    };

    resolveLocation();

    return () => {
      mounted = false;
    };
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