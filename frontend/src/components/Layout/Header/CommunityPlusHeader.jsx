import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";

import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext";

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { viewLocation, setViewLocation } = useLocationContext();
  const { appUser } = useAuth();

  const [manualLocation, setManualLocation] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  const effectiveUser = appUser?.user || appUser || user;

  /* ===============================
     USERNAME / INITIALS
  =============================== */

  const username = useMemo(() => {
    if (!effectiveUser) return "Member";

    const email =
      effectiveUser?.email ||
      effectiveUser?.attributes?.email ||
      effectiveUser?.signInDetails?.loginId ||
      "";

    if (email.includes("@")) return email.split("@")[0];

    if (effectiveUser?.username) return effectiveUser.username;

    return "Member";
  }, [effectiveUser]);

  const initials = useMemo(() => {
    if (!username) return "ME";

    const parts = username.split(/[\s._-]+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return ((parts[0][0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }, [username]);

  /* ===============================
     LOCATION HELPERS
  =============================== */

  const formatLocationLabel = (loc) => {
    if (!loc) return "";

    const stateMap = {
      Victoria: "VIC",
      "New South Wales": "NSW",
      Queensland: "QLD",
      "South Australia": "SA",
      Tasmania: "TAS",
      "Western Australia": "WA",
      "Northern Territory": "NT",
      ACT: "ACT",
    };

    const stateShort = stateMap[loc.state] || loc.state;

    return `${loc.suburb || loc.city || loc.label || ""}${
      stateShort ? `, ${stateShort}` : ""
    }${loc.postcode ? ` ${loc.postcode}` : ""}`.trim();
  };

  const isExactLocation = useMemo(() => {
    const acc = viewLocation?.accuracy;
    return typeof acc === "number" && acc <= 50;
  }, [viewLocation]);

  /* ===============================
     SYNC INPUT FROM CONTEXT
  =============================== */

  useEffect(() => {
    if (!viewLocation) return;

    const label =
      viewLocation.label ||
      formatLocationLabel(viewLocation) ||
      "";

    setManualLocation(label);

    console.log("📍 Header viewLocation:", viewLocation);
  }, [viewLocation?.updatedAt]);

  /* ===============================
     COMMIT LOCATION (FIXED)
  =============================== */

  const handleCommit = () => {
    if (isExactLocation) return;

    const value = manualLocation.trim();
    if (!value) return;

    const newLocation = {
      label: value,
      suburb: value,
      city: value,
      state: null,
      postcode: null,
      lat: null,
      lng: null,
      accuracy: null,
      type: "manual",
    };

    setViewLocation(newLocation, "manual");
  };

  /* ===============================
     MENU OUTSIDE CLICK
  =============================== */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     NAV HELPERS
  =============================== */

  const go = (path) => {
    if (routeLocation.pathname !== path) {
      navigate(path);
    }
  };

  const isActive = (path) => routeLocation.pathname === path;

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header">

      {/* TOP ROW */}
      <div className="header-row">

        {/* LEFT */}
        <div className="logo-container">

          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/home")}
          />

          {/* LOCATION */}
          <div className="location-display">
            <span className={`location-pin ${isExactLocation ? "exact" : ""}`}>
              📍
            </span>

            <input
              className={`location-input ${isExactLocation ? "locked" : ""}`}
              value={manualLocation}
              readOnly={isExactLocation}
              placeholder="Enter location"
              onChange={(e) => setManualLocation(e.target.value)}
              onBlur={handleCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommit();
                  e.target.blur();
                }
              }}
            />
          </div>

        </div>

        {/* CENTER */}
        <div className="header-center">
          <div className="search-wrapper">
            <input className="search-input" placeholder="Search" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="header-right" ref={menuRef}>

          {effectiveUser && (
            <div className="user-block">

              <span className="username">
                {username}
              </span>

              <div
                className="avatar"
                onClick={() => setShowMenu(!showMenu)}
              >
                {initials}
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <div
                    className="menu-item"
                    onClick={() => go("/profile")}
                  >
                    Profile
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => onLogout?.()}
                  >
                    Logout
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* NAV */}
      <nav className="links">

        <button onClick={() => go("/home")} className={isActive("/home") ? "active" : ""}>Home</button>
        <button onClick={() => go("/post")} className={isActive("/post") ? "active" : ""}>Post</button>
        <button onClick={() => go("/event")} className={isActive("/event") ? "active" : ""}>Event</button>
        <button onClick={() => go("/incident")} className={isActive("/incident") ? "active" : ""}>Incident</button>
        <button onClick={() => go("/search")} className={isActive("/search") ? "active" : ""}>Search</button>
        <button onClick={() => go("/communityplus")} className={isActive("/communityplus") ? "active" : ""}>Community+</button>
        <button onClick={() => go("/yellowpages")} className={isActive("/yellowpages") ? "active" : ""}>Yellow Pages</button>
        <button onClick={() => go("/about")} className={isActive("/about") ? "active" : ""}>About</button>
        <button onClick={() => go("/merch")} className={isActive("/merch") ? "active" : ""}>Merch</button>

      </nav>

    </header>
  );
}