import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./CommunityPlusHeader.css";

import { useAuth } from "../../../context/AuthContext";
import { useUserLocation } from "../../../hooks/useUserLocation";
import LocationPin from "../../UI/LocationPin";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

const formatLocation = (loc) =>
  [loc?.suburb, loc?.state].filter(Boolean).join(", ");

export default function CommunityPlusHeader({ onLogout }) {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  const { user, loading: userLoading } = useAuth();

  const {
    location,
    loading: locationLoading,
    mode,
    setAutoMode,
  } = useUserLocation();

  const [showMenu, setShowMenu] = useState(false);

  const username = user?.name || user?.username || "Guest";

  const initials = useMemo(() => {
    if (!username || username === "Guest") return "G";

    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [username]);

  const nav = useMemo(
    () => NAVIGATION.find((item) => item.group === "main") || { items: [] },
    []
  );

  const go = useCallback(
    (path) => {
      if (!path || routeLocation.pathname === path) return;

      navigate(path);
      setShowMenu(false);
    },
    [navigate, routeLocation.pathname]
  );

  const isActiveRoute = useCallback(
    (path) =>
      Boolean(
        path &&
          (routeLocation.pathname === path ||
            routeLocation.pathname.startsWith(`${path}/`))
      ),
    [routeLocation.pathname]
  );

  const handleLocationClick = useCallback(() => {
    setAutoMode();
  }, [setAutoMode]);

  const locationLabel = useMemo(() => {
    if (locationLoading && location) return formatLocation(location);
    if (locationLoading) return "Detecting location...";
    if (location) return formatLocation(location);

    return "Set location";
  }, [location, locationLoading]);

  return (
    <header className="header">
      <div className="header-row">
        <div className="header-left">
          <img
            src="/logo/logo.png"
            alt="Community One"
            className="logo"
            onClick={() => go("/communityplus")}
          />

          <button
            type="button"
            className={`location-display ${mode === "auto" ? "auto" : "manual"}`}
            onClick={handleLocationClick}
            title={mode === "manual" ? "Use current location" : "Refresh location"}
          >
            <LocationPin loading={locationLoading} />
            <span>{locationLabel}</span>
          </button>
        </div>

        <div className="header-center">
          <input className="search-input" placeholder="Search your area..." />
        </div>

        <div className="header-right">
          <div className="user-block">
            <span className="username">{userLoading ? "..." : username}</span>

            <button
              type="button"
              className="avatar"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              {initials}
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <button type="button" onClick={() => go("/communityplus/profile")}>
                  Profile
                </button>

                <button type="button" onClick={() => onLogout?.()}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="header-nav">
        {nav.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActiveRoute(item.path) ? "active" : ""}`}
            onClick={() => go(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}