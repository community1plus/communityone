import React, { useState, useEffect } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut, coords }) {

  const [location, setLocation] = useState("Locating...");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {

    if (!coords) return;

    const cachedLocation = localStorage.getItem("userLocation");

    // Use cached suburb if available
    if (cachedLocation) {
      setLocation(cachedLocation);
      return;
    }

    const getSuburb = async () => {

      try {

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );

        const data = await res.json();

        const components = data.results[0]?.address_components || [];

        const suburb = components.find(c =>
          c.types.includes("locality") ||
          c.types.includes("sublocality") ||
          c.types.includes("sublocality_level_1") ||
          c.types.includes("postal_town")
        );

        const state = components.find(c =>
          c.types.includes("administrative_area_level_1")
        );

        if (suburb && state) {

          const locationString = `${suburb.long_name}, ${state.short_name}`;

          setLocation(locationString);

          // Save to cache
          localStorage.setItem("userLocation", locationString);

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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="header">

      <div className="header-row">

        <div className="header-left logo-container">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
          />
        </div>

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