import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./CommunityPlusHeader.css";

import { useAuth } from "../../../context/AuthContext";
import { useGoogleMaps } from "../../../context/GoogleMapsProvider";

import { useUserLocation } from "../../../hooks/useUserLocation"; // 🔥 new hook
import LocationPin from "../../UI/LocationPin";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

/* ===============================
   HELPERS
=============================== */

const formatLocation = (loc) =>
  [loc?.suburb, loc?.state].filter(Boolean).join(", ");

/* ===============================
   COMPONENT
=============================== */

export default function CommunityPlusHeader({ onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { user, loading } = useAuth();
  const { isLoaded } = useGoogleMaps();

  const { location, loading: locationLoading, mode,setAutoMode } = useUserLocation();

  const [showMenu, setShowMenu] = useState(false);

  /* ===============================
     USER
  =============================== */

  const username = user?.name || user?.username || "Guest";

  const initials = useMemo(() => {
    if (!username || username === "Guest") return "G";

    return username
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [username]);

  /* ===============================
     NAV
  =============================== */

  const nav = useMemo(
    () => NAVIGATION.find((n) => n.group === "main") || { items: [] },
    []
  );

  const isActiveRoute = useCallback(
    (path) =>
      path &&
      (routeLocation.pathname === path ||
        routeLocation.pathname.startsWith(path + "/")),
    [routeLocation.pathname]
  );

  const go = useCallback(
    (path) => {
      if (path && routeLocation.pathname !== path) {
        navigate(path);
      }
    },
    [navigate, routeLocation.pathname]
  );

  /* ===============================
     LOCATION DISPLAY
  =============================== */

  const locationLabel = useMemo(() => {
    if (locationLoading) return "Detecting location...";
    if (location) return formatLocation(location);
    return "Set location";
  }, [location, locationLoading]);

  /* ===============================
     RENDER
  =============================== */

  return (
    <header className="header">
      {/* ================= ROW 1 ================= */}
      <div className="header-row">
        {/* LEFT */}
        <div className="header-left">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/communityplus")}
          />

          <div
            className="location-display"
            onClick={setAutoMode}
            title={mode === "manual" ? "Use current location" : "Refresh location"}
        >
            <LocationPin loading={locationLoading} />
            <span>{locationLabel}</span>
        </div>

        {/* CENTER */}
        <div className="header-center">
          <input
            className="search-input"
            placeholder="Search your area..."
          />
        </div>

        {/* RIGHT */}
        <div className="header-right">
          <div className="user-block">
            <span className="username">
              {loading ? "..." : username}
            </span>

            <div
              className="avatar"
              onClick={() => setShowMenu((p) => !p)}
            >
              {initials}
            </div>

            {showMenu && (
              <div className="dropdown-menu">
                <div onClick={() => go("/communityplus/profile")}>
                  Profile
                </div>
                <div onClick={() => onLogout?.()}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= ROW 2 ================= */}
      <nav className="header-nav">
        {nav.items.map((item) => {
          const active = isActiveRoute(item.path);

          return (
            <button
              key={item.id}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => go(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}