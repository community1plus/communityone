import React, { useState, useEffect } from "react";
import GoogleStyleSearch from "./GoogleStyleSearch";
import "../src/CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");

  useEffect(() => {

    // Fallback using IP when GPS fails
    const fallbackToIP = () => {
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
    };

    // Try GPS first
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          // Free reverse geocoder (OpenStreetMap)
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                null;

              const region =
                data.address.state ||
                data.address.region ||
                null;

              if (city && region) {
                setLocation(`${city}, ${region}`);
              } else {
                fallbackToIP();
              }
            })
            .catch(fallbackToIP);
        },
        fallbackToIP
      );
    } else {
      fallbackToIP();
    }
  }, []);

  return (
    <header className="header">
      
      {/* TOP ROW */}
      <div className="header-top">

        {/* LEFT: Avatar */}
        <div className="left-section">
          <div className="avatar">C</div>
        </div>

        {/* CENTER: Search Bar */}
        <div className="center-section">
          <div className="search-wrapper">
            <GoogleStyleSearch />
          </div>
        </div>

        {/* RIGHT: Location */}
        <div className="right-section">
          <div className="geo">{location}</div>
        </div>

      </div>

      {/* SECOND ROW: Navigation */}
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
