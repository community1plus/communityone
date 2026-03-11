import React, { useState, useEffect } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Locating...");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {

    const getSuburb = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );

        const data = await res.json();

        const components = data.results[0]?.address_components || [];

        const suburb = components.find(c =>
          c.types.includes("locality")
        );

        const state = components.find(c =>
          c.types.includes("administrative_area_level_1")
        );

        if (suburb && state) {
          setLocation(`${suburb.long_name}, ${state.short_name}`);
        } else {
          setLocation("Location unavailable");
        }

      } catch {
        setLocation("Location unavailable");
      }
    };

    if ("geolocation" in navigator) {

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          getSuburb(lat, lng);
        },
        () => {
          setLocation("Location unavailable");
        }
      );

    } else {
      setLocation("Location unavailable");
    }

  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="header">

      {/* ======================
          TOP ROW (GRID LAYOUT)
      ====================== */}
      <div className="header-row">

        {/* LEFT — Logo */}
        <div className="header-left logo-container">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
          />
        </div>

        {/* CENTER — Search */}
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

        {/* RIGHT — Avatar + Location */}
        <div className="header-right">

          <span className="location-text">{location}</span>

          <div className="avatar-wrapper">

            <div
              className="avatar"
              onClick={toggleMenu}
            >
              {user?.username?.[0]?.toUpperCase() ?? "C"}
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
                    signOut();
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

      {/* ======================
          NAV ROW
      ====================== */}
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