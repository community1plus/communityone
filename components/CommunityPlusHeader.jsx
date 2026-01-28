import React, { useState, useEffect } from "react";
import GoogleStyleSearch from "./GoogleStyleSearch";
import "../src/CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>

      {/* TOP ROW */}
      <div className="header-top">

        {/* LEFT: Avatar */}
        <div className="left-section">
          <div className="avatar">C</div>
        </div>

        {/* CENTER: Search */}
        <div className="center-section">
          <div className="search-wrapper">
            <GoogleStyleSearch />
          </div>
        </div>

        {/* RIGHT: Location / Mobile Menu */}
        <div className="right-section">
          <div className="geo hide-mobile">{location}</div>
          <div className="hamburger show-mobile" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>
        </div>

      </div>

      {/* NAVIGATION ROW */}
      <nav className={`links ${menuOpen ? "open" : ""}`}>
        <button onClick={() => setActiveView("dashboard")}>Home</button>
        <button onClick={() => setActiveView("posts")}>Posts</button>
        <button onClick={() => setActiveView("events")}>Events</button>
        <button onClick={() => setActiveView("incidents")}>Incidents</button>
        <button onClick={() => setActiveView("search")}>Search</button>
        <button onClick={() => setActiveView("community")}>Community+</button>
        <button onClick={() => setActiveView("about")}>About</button>
      </nav>
    </header>
  );
}

export default CommunityPlusHeader;
