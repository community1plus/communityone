import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusHeader.css";

import { useLocationContext } from "../../../context/LocationContext";
import { useAuth } from "../../../context/AuthContext";

export default function CommunityPlusHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const {
    viewLocation,
    setViewLocation,
    enableLiveLocation,
  } = useLocationContext();

  const { appUser } = useAuth();

  const [manualLocation, setManualLocation] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [resolving, setResolving] = useState(false);

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
     LOCATION STATE
  =============================== */

  const hasLocation =
    !!viewLocation?.lat ||
    !!viewLocation?.suburb ||
    !!viewLocation?.label;

  /* ===============================
     SYNC INPUT
  =============================== */

  useEffect(() => {
    if (!viewLocation) return;

    const label =
      viewLocation.label ||
      viewLocation.suburb ||
      viewLocation.city ||
      "";

    setManualLocation(label);

    console.log("📍 Header location:", viewLocation);
  }, [viewLocation?.updatedAt]);

  /* ===============================
     RESOLVE LOCATION (PIN CLICK)
  =============================== */

  const handleResolveLocation = async () => {
    console.log("📍 Resolving location...");

    setResolving(true);

    try {
      await enableLiveLocation();
    } catch (err) {
      console.error("Location resolve failed:", err);
    } finally {
      setResolving(false);
    }
  };

  /* ===============================
     MANUAL COMMIT
  =============================== */

  const handleCommit = () => {
    const value = manualLocation.trim();
    if (!value) return;

    const newLocation = {
      label: value,
      suburb: value,
      city: value,
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

      <div className="header-row">

        {/* LEFT */}
        <div className="logo-container">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/home")}
          />

          <div className="location-display">

            {/* PIN */}
            <span
              className={`location-pin ${
                hasLocation ? "resolved" : "unresolved"
              } ${resolving ? "loading" : ""}`}
              onClick={handleResolveLocation}
              title={
                hasLocation
                  ? "Location detected (click to refresh)"
                  : "Click to detect location"
              }
            >
              {resolving ? "⏳" : "📍"}
            </span>

            {/* INPUT */}
            <input
              className="location-input"
              value={manualLocation}
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

              <span className="username">{username}</span>

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
      </nav>

    </header>
  );
}