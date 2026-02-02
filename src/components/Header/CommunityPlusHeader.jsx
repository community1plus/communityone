import React, { useState, useEffect } from "react";
import "./CommunityPlusHeader.css";

function CommunityPlusHeader({ setActiveView, user, signOut }) {
  const [location, setLocation] = useState("Fetching location...");

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

  return (
    <header className="header">

      {/* LEFT — Avatar */}
      <div className="header-left">
        <div className="avatar">
          {user?.username?.[0]?.toUpperCase() ?? "C"}
        </div>
      </div>

      {/* CENTER — Search */}
      <div className="header-center">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search community updates..."
          />
          <span className="search-enter">⤶</span>
        </div>
      </div>

      {/* RIGHT — Location */}
      <div className="header-right">
        {location}
      </div>

      {/* NAV BAR (full width below header row) */}
      <nav className="links">
        <button onClick={() => setActiveView("dashboard")}>Home</button>
        <button onClick={() => setActiveView("posts")}>Posts</button>
        <button onClick={() => setActiveView("events")}>Events</button>
        <button onClick={() => setActiveView("inc
