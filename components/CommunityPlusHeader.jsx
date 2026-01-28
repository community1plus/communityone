import React, { useState, useEffect } from "react";
import GoogleStyleSearch from "./GoogleStyleSearch";
import "../src/CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`${data.city}, ${data.region}`);
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
      {/* TOP ROW */}
      <div className="header-top">
        <div className="logo-container">
          <div className="avatar">C</div>
          <div className="search-wrapper">
            <GoogleStyleSearch />
          </div>
        </div>
        <div className="geo">{location}</div>
      </div>

      {/* BOTTOM ROW: Navigation */}
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
