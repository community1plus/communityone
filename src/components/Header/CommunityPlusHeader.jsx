import React, { useState, useEffect } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.city && data.region) {
          setLocation(`${data.city}, ${data.region}`);
        } else {
          setLocation("Location unavailable");
        }
      })
      .catch(() => setLocation("Location unavailable"));
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
        <div className="header-left logo-container" onClick={toggleMenu}>
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
          />

          {showMenu && (
            <div className="dropdown-menu">
              <div
                className="menu-item"
                onClick={() => setActiveView("profile")}
              >
                Profile Settings
              </div>

              <div
                className="menu-item"
                onClick={signOut}
              >
                Logout
              </div>
            </div>
          )}
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

          <div className="avatar">
            {user?.username?.[0]?.toUpperCase() ?? "C"}
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
      </nav>

    </header>
  );
}

export default CommunityPlusHeader;