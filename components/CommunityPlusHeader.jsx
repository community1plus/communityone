import React, { useState, useEffect } from "react";
import GoogleStyleSearch from "./GoogleStyleSearch";

export default function CommunityPlusHeader({ setActiveView }) {
  const [location, setLocation] = useState("Locating...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => {
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => {
            if (data.city && data.region) {
              setLocation(`${data.city}, ${data.region}`);
            } else {
              setLocation("Unknown location");
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
              setLocation("Unknown location");
            }
          })
          .catch(() => setLocation("Location unavailable"));
      }
    );
  }, []);

  return (
    <>
      {/* TOP HEADER */}
      <header className="header">
        <div className="header-top">
          <div className="avatar">C</div>

          <div className="center-section">
            <div className="search-wrapper">
              <GoogleStyleSearch />
            </div>
          </div>

          <div className="geo">{location}</div>
        </div>
      </header>

      {/* NAV BAR */}
      <nav className="links">
        <button onClick={() => setActiveView("dashboard")}>Home</button>
        <button onClick={() => setActiveView("posts")}>Posts</button>
        <button onClick={() => setActiveView("events")}>Events</button>
        <button onClick={() => setActiveView("incidents")}>Incidents</button>
        <button onClick={() => setActiveView("search")}>Search</button>
        <button onClick={() => setActiveView("community")}>Community+</button>
        <button onClick={() => setActiveView("about")}>About</button>
      </nav>
    </>
  );
}
