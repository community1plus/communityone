import React, { useState, useEffect } from "react";
import GoogleStyleSearch from "../Search/GoogleStyleSearch";
import "../src/components/Header/CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
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
        },
        () => {
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
        }
      );
    }
  }, []);

  return (
    <header className="header">
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

        {/* RIGHT: Geo */}
        <div className="right-section">
          <div className="geo">{location}</div>
        </div>
      </div>

      {/* NAV ROW */}
      <nav className="links">
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
